// 외부 Spring(marketgo) 호출의 단일 창구.
//
// 스펙: https://api.marketgo.kro.kr/v3/api-docs — **라이브가 진실 소스**다.
// 필드를 여기 복제하지 않는다. 함정 목록은 `backend-api-reference` 스킬 §2.
//
// 주의: 스펙의 `servers[0].url`이 `http://`로 잡혀 있으나 그대로 쓰지 않는다(§2).

import "server-only";

import { z } from "zod";
import { ApiError } from "./api-error";
import { debugSpringPayload } from "./spring-payload-debug";
import { getSpringBaseUrl, SPRING_REQUEST_TIMEOUT_MS } from "./spring-config";

export function springUrl(path: string, query?: QueryParams): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("Spring API path는 /로 시작하는 same-origin 상대 경로여야 합니다.");
  }

  const baseUrl = getSpringBaseUrl();
  const url = new URL(path, baseUrl);
  if (url.origin !== baseUrl.origin) {
    throw new Error("Spring API path는 base URL과 같은 origin이어야 합니다.");
  }
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

/**
 * 캐싱 의도는 **항상 명시한다** (conventions #11).
 * - `{ revalidate, tags }` — 모두에게 같은 공개 데이터
 * - `"no-store"` — 로그인 사용자별로 달라지는 응답
 *
 * ⚠️ 응답에 `isLiked` 같은 개인화 필드가 섞이면 반드시 `"no-store"`다.
 *    유저별 응답을 공유 캐시에 넣으면 남의 찜 상태가 보인다.
 */
export type CachePolicy = "no-store" | { revalidate: number | false; tags?: string[] };

interface SpringRequest<TSchema extends z.ZodType | undefined> {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: QueryParams;
  body?: unknown;
  /** Spring accessToken. **서버에서만 붙인다** — 클라이언트로 넘어가면 Critical. */
  token?: string;
  /** 재발급처럼 쿠키를 되돌려 보내야 할 때. 서버 fetch에는 쿠키 저장소가 없어 수동으로 붙인다. */
  cookie?: string;
  cache: CachePolicy;
  /** 응답 검증 스키마. 204 등 본문이 없으면 생략한다. */
  schema?: TSchema;
}

type Parsed<TSchema> = TSchema extends z.ZodType ? z.infer<TSchema> : void;

type PayloadShape =
  | { kind: "array"; length: number; item?: PayloadShape }
  | { kind: "object"; fieldCount: number; truncated: boolean; fields?: PayloadShape[] }
  | {
      kind:
        | "null"
        | "bigint"
        | "boolean"
        | "function"
        | "number"
        | "string"
        | "symbol"
        | "undefined";
    };

const responseTraceIds = new WeakMap<Response, string>();

function isSpringDebugEnabled(): boolean {
  if (process.env.VERCEL_ENV === "production") return false;
  const override = process.env.SPRING_API_DEBUG?.trim().toLowerCase();
  if (override === "true") return true;
  if (override === "false") return false;
  return process.env.NODE_ENV === "development";
}

function payloadShape(value: unknown, depth = 0): PayloadShape {
  if (value === null) return { kind: "null" };
  if (Array.isArray(value)) {
    const item = value.length > 0 && depth < 2 ? payloadShape(value[0], depth + 1) : undefined;
    return item
      ? { kind: "array", length: value.length, item }
      : { kind: "array", length: value.length };
  }
  const kind = typeof value;
  if (kind === "object") {
    const objectValue = value ?? {};
    const fields: PayloadShape[] = [];
    let fieldCount = 0;
    let truncated = false;
    for (const key in objectValue) {
      if (!Object.prototype.hasOwnProperty.call(objectValue, key)) continue;
      fieldCount += 1;
      if (fieldCount > 20) {
        truncated = true;
        fieldCount = 20;
        break;
      }
      if (depth < 2) fields.push(payloadShape(Reflect.get(objectValue, key), depth + 1));
    }
    return depth < 2
      ? { kind: "object", fieldCount, truncated, fields }
      : { kind: "object", fieldCount, truncated };
  }
  return { kind };
}

/**
 * OpenAPI가 오류 body에도 성공 DTO를 재사용해 형태를 신뢰할 수 없다.
 * 그래도 로컬 재현을 위해 개발 로그에는 자주 쓰이는 code/message 문자열만
 * 길이를 제한해 남긴다. 분기는 여전히 HTTP status만 쓴다.
 */
function errorField(payload: unknown, key: "code" | "message"): string | undefined {
  if (typeof payload !== "object" || payload === null) return undefined;
  const value = Reflect.get(payload, key);
  if (typeof value !== "string") return undefined;
  return value.slice(0, 300);
}

function cacheDescription(cache: CachePolicy): string {
  if (cache === "no-store") return cache;
  const tags = cache.tags?.length ? ` tags=${cache.tags.join(",")}` : "";
  return `revalidate=${String(cache.revalidate)}${tags}`;
}

function authDescription(token?: string, cookie?: string): string {
  if (token && cookie) return "bearer+cookie";
  if (token) return "bearer";
  if (cookie) return "cookie";
  return "anonymous";
}

function springDebug(event: () => Record<string, unknown>): void {
  if (!isSpringDebugEnabled()) return;
  console.info("[spring-api]", event());
}

function cacheInit(cache: CachePolicy): RequestInit {
  if (cache === "no-store") return { cache: "no-store" };
  return { next: { revalidate: cache.revalidate, tags: cache.tags } };
}

/** Spring 응답 원본까지 필요한 호출(로그인 — `Set-Cookie`를 읽어야 한다)용. */
export async function springRaw(request: Omit<SpringRequest<undefined>, "schema">): Promise<Response> {
  const { path, method = "GET", query, body, token, cookie, cache } = request;
  const url = springUrl(path, query);

  // FormData는 boundary가 붙은 `multipart/form-data`를 fetch가 직접 만들어야 한다 —
  // 우리가 Content-Type을 적으면 boundary가 빠져 서버가 파싱하지 못한다.
  const isMultipart = body instanceof FormData;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined && !isMultipart) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cookie) headers.Cookie = cookie;
  const serializedBody = body === undefined ? undefined : isMultipart ? body : JSON.stringify(body);
  const debugContext = isSpringDebugEnabled()
    ? {
        startedAt: performance.now(),
        metadata: {
          traceId: crypto.randomUUID().slice(0, 8),
          method,
          path,
          queryKeys: query
            ? Object.entries(query)
                .filter(([, value]) => value !== undefined && value !== null && value !== "")
                .map(([key]) => key)
                .sort()
            : [],
          cache: cacheDescription(cache),
          auth: authDescription(token, cookie),
        },
      }
    : undefined;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: serializedBody as BodyInit | undefined,
      signal: AbortSignal.timeout(SPRING_REQUEST_TIMEOUT_MS),
      ...cacheInit(cache),
    });
    if (debugContext) {
      responseTraceIds.set(response, debugContext.metadata.traceId);
      springDebug(() => ({
        event: "response",
        ...debugContext.metadata,
        status: response.status,
        ok: response.ok,
        durationMs: Math.round(performance.now() - debugContext.startedAt),
      }));
    }
    return response;
  } catch (cause) {
    if (debugContext) {
      springDebug(() => ({
        event: "network-error",
        ...debugContext.metadata,
        durationMs: Math.round(performance.now() - debugContext.startedAt),
      }));
    }
    throw ApiError.network(`${method} ${path}`, cause);
  }
}

/**
 * Spring 호출 + 경계 검증. 실패는 전부 `ApiError`로 통일한다.
 *
 * 에러 분기는 HTTP status만 신뢰한다. 스펙이 4xx/5xx에 성공 스키마를
 * 재사용해 body 형태를 알 수 없기 때문이다(`backend-api-reference` §2).
 * 단, 로컬 진단을 위해 개발 환경에서만 code/message를 제한된 길이로 로그한다.
 */
export async function springFetch<TSchema extends z.ZodType | undefined = undefined>(
  request: SpringRequest<TSchema>,
): Promise<Parsed<TSchema>> {
  const { path, method = "GET", schema } = request;
  const endpoint = `${method} ${path}`;

  const response = await springRaw(request);

  if (!response.ok) {
    if (isSpringDebugEnabled()) {
      let payload: unknown;
      try {
        payload = await response.clone().json();
      } catch {
        payload = undefined;
      }
      springDebug(() => ({
        event: "error",
        traceId: responseTraceIds.get(response),
        endpoint,
        status: response.status,
        code: errorField(payload, "code"),
        message: errorField(payload, "message"),
        payload: payloadShape(payload),
      }));
    }
    throw ApiError.fromStatus(response.status, endpoint);
  }

  if (!schema) return undefined as Parsed<TSchema>;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (cause) {
    springDebug(() => ({
      event: "parse-error",
      traceId: responseTraceIds.get(response),
      endpoint,
      reason: "invalid-json",
    }));
    throw ApiError.parse(endpoint, cause instanceof Error ? cause.message : "JSON 아님");
  }

  const result = schema.safeParse(payload);
  if (!result.success) {
    springDebug(() => ({
      event: "parse-error",
      traceId: responseTraceIds.get(response),
      endpoint,
      reason: "schema-mismatch",
      payload: payloadShape(payload),
    }));
    throw ApiError.parse(endpoint, z.prettifyError(result.error));
  }
  debugSpringPayload({
    endpoint,
    payload: result.data,
    personalized: Boolean(request.token || request.cookie) || request.cache === "no-store",
  });
  springDebug(() => ({
    event: "validated",
    traceId: responseTraceIds.get(response),
    endpoint,
    payload: payloadShape(result.data),
  }));
  return result.data as Parsed<TSchema>;
}
