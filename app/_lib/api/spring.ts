// 외부 Spring(marketgo) 호출의 단일 창구.
//
// 스펙: https://api.marketgo.kro.kr/v3/api-docs — **라이브가 진실 소스**다.
// 필드를 여기 복제하지 않는다. 함정 목록은 `backend-api-reference` 스킬 §2.
//
// 주의: 스펙의 `servers[0].url`이 `http://`로 잡혀 있으나 그대로 쓰지 않는다(§2).

import "server-only";

import { z } from "zod";
import { ApiError } from "./api-error";
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

function cacheInit(cache: CachePolicy): RequestInit {
  if (cache === "no-store") return { cache: "no-store" };
  return { next: { revalidate: cache.revalidate, tags: cache.tags } };
}

/** Spring 응답 원본까지 필요한 호출(로그인 — `Set-Cookie`를 읽어야 한다)용. */
export async function springRaw(request: Omit<SpringRequest<undefined>, "schema">): Promise<Response> {
  const { path, method = "GET", query, body, token, cookie, cache } = request;
  const url = springUrl(path, query);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cookie) headers.Cookie = cookie;

  try {
    return await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(SPRING_REQUEST_TIMEOUT_MS),
      ...cacheInit(cache),
    });
  } catch (cause) {
    throw ApiError.network(`${method} ${path}`, cause);
  }
}

/**
 * Spring 호출 + 경계 검증. 실패는 전부 `ApiError`로 통일한다.
 *
 * 에러 본문은 파싱하지 않는다 — 스펙이 4xx/5xx에 성공 스키마를 재사용해
 * 형태를 알 수 없기 때문이다(`backend-api-reference` §2).
 */
export async function springFetch<TSchema extends z.ZodType | undefined = undefined>(
  request: SpringRequest<TSchema>,
): Promise<Parsed<TSchema>> {
  const { path, method = "GET", schema } = request;
  const endpoint = `${method} ${path}`;

  const response = await springRaw(request);

  if (!response.ok) throw ApiError.fromStatus(response.status, endpoint);

  if (!schema) return undefined as Parsed<TSchema>;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (cause) {
    throw ApiError.parse(endpoint, cause instanceof Error ? cause.message : "JSON 아님");
  }

  const result = schema.safeParse(payload);
  if (!result.success) {
    throw ApiError.parse(endpoint, z.prettifyError(result.error));
  }
  return result.data as Parsed<TSchema>;
}
