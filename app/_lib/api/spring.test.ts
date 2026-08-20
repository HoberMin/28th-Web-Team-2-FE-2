import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError } from "./api-error";
import { springFetch, springRaw, springUrl } from "./spring";

interface NextFetchInit extends RequestInit {
  next?: {
    revalidate: number | false;
    tags?: string[];
  };
}

describe("Spring API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("경로에 정의된 쿼리만 문자열로 직렬화한다", () => {
    const url = new URL(
      springUrl("/api/v1/items", {
        regionId: "0111010100",
        page: 0,
        favoriteOnly: false,
        keyword: "감자",
        empty: "",
        missing: undefined,
      }),
    );

    expect(url.origin).toBe("https://api.marketgo.kro.kr");
    expect(url.pathname).toBe("/api/v1/items");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      regionId: "0111010100",
      page: "0",
      favoriteOnly: "false",
      keyword: "감자",
    });
  });

  it("환경변수 base URL이 안전하지 않으면 요청 URL을 만들지 않는다", () => {
    vi.stubEnv("SPRING_API_BASE_URL", "http://user:password@api.example.com/v1");

    expect(() => springUrl("/api/v1/news")).toThrow("SPRING_API_BASE_URL");
  });

  it.each([
    ["절대 URL", "https://attacker.example/collect"],
    ["protocol-relative URL", "//attacker.example/collect"],
  ])("%s 경로로 Spring origin을 벗어나지 못한다", (_case, path) => {
    expect(() => springUrl(path)).toThrow("same-origin");
  });

  it("인증 POST를 no-store로 보내며 토큰을 서버 헤더에만 담는다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await springRaw({
      path: "/api/auth/reissue",
      method: "POST",
      body: { sample: true },
      token: "access-token",
      cookie: "refreshToken=refresh-token",
      cache: "no-store",
    });

    const [input, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(input)).toBe("https://api.marketgo.kro.kr/api/auth/reissue");
    expect(init).toMatchObject({
      method: "POST",
      cache: "no-store",
      body: JSON.stringify({ sample: true }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer access-token",
        Cookie: "refreshToken=refresh-token",
      },
    });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(init?.signal?.aborted).toBe(false);
  });

  it("공개 GET에 revalidate와 cache tag를 전달한다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(Response.json([]));
    vi.stubGlobal("fetch", fetchMock);

    await springRaw({
      path: "/api/v1/news",
      cache: { revalidate: 1_800, tags: ["news"] },
    });

    const [, init] = fetchMock.mock.calls[0] ?? [];
    expect((init as NextFetchInit | undefined)?.next).toEqual({
      revalidate: 1_800,
      tags: ["news"],
    });
    expect(init?.cache).toBeUndefined();
  });

  it("개발 로그에 몸은 감추고 요청·응답 형태만 남긴다", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SPRING_API_DEBUG", "");
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(
      Response.json({ data: { items: [{ id: 7, name: "감자" }] } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await springFetch({
      path: "/api/v1/items",
      method: "POST",
      query: { keyword: "감자", empty: "" },
      body: { nickname: "민감정보" },
      token: "sensitive-access-token",
      cookie: "refreshToken=sensitive-refresh-token",
      cache: "no-store",
      schema: z.object({
        data: z.object({ items: z.array(z.object({ id: z.number(), name: z.string() })) }),
      }),
    });

    expect(infoSpy).toHaveBeenNthCalledWith(
      1,
      "[spring-api]",
      expect.objectContaining({
        event: "response",
        traceId: expect.any(String),
        method: "POST",
        path: "/api/v1/items",
        queryKeys: ["keyword"],
        cache: "no-store",
        auth: "bearer+cookie",
        status: 200,
        ok: true,
        durationMs: expect.any(Number),
      }),
    );
    expect(infoSpy).toHaveBeenNthCalledWith(
      2,
      "[spring-api]",
      expect.objectContaining({
        event: "validated",
        endpoint: "POST /api/v1/items",
        payload: expect.objectContaining({ kind: "object", fieldCount: 1, truncated: false }),
      }),
    );

    const serializedLogs = JSON.stringify(infoSpy.mock.calls);
    expect(serializedLogs).not.toContain("sensitive-access-token");
    expect(serializedLogs).not.toContain("sensitive-refresh-token");
    expect(serializedLogs).not.toContain("민감정보");
    expect(serializedLogs).not.toContain("감자");
  });

  it("명시적으로 끈 운영 환경에서 디버그 로그를 비활성화한다", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SPRING_API_DEBUG", "false");
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(Response.json([]));
    vi.stubGlobal("fetch", fetchMock);

    await springFetch({
      path: "/api/v1/news",
      cache: { revalidate: 60 },
      schema: z.array(z.unknown()),
    });

    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("Vercel Production에서는 디버그 플래그를 잘못 켜도 로그를 남기지 않는다", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("SPRING_API_DEBUG", "true");
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(Response.json([]));
    vi.stubGlobal("fetch", fetchMock);

    await springFetch({
      path: "/api/v1/news",
      cache: { revalidate: 60 },
      schema: z.array(z.unknown()),
    });

    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("스키마 불일치 응답의 동적 object key를 로그에 노출하지 않는다", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(Response.json({ "user@example.com": { count: 1 } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      springFetch({
        path: "/api/v1/news",
        cache: { revalidate: 60 },
        schema: z.array(z.unknown()),
      }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(JSON.stringify(infoSpy.mock.calls)).not.toContain("user@example.com");
  });

  it("명시적으로 켠 로컬 환경에서 공개 GET 응답 값을 제한된 JSON으로 출력한다", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("SPRING_API_DEBUG_PAYLOAD", "true");
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const items = Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      name:
        index === 0 ? "first-visible" : index === 10 ? "hidden-eleven" : `item-${index + 1}`,
    }));
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(
      Response.json({
        accessToken: "sensitive-access-token",
        p_cert_key: "sensitive-cert-key",
        data: { items },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await springFetch({
      path: "/api/v1/items",
      cache: { revalidate: 60 },
      schema: z.object({
        accessToken: z.string(),
        p_cert_key: z.string(),
        data: z.object({ items: z.array(z.object({ id: z.number(), name: z.string() })) }),
      }),
    });

    const payloadLog = infoSpy.mock.calls
      .map(([message]) => message)
      .find(
        (message) =>
          typeof message === "string" && message.startsWith("[spring-api:payload] GET /api/v1/items"),
      );
    expect(payloadLog).toContain("first-visible");
    expect(payloadLog).toContain('"$omittedItems": 2');
    expect(payloadLog).toContain("[REDACTED]");
    expect(payloadLog).not.toContain("hidden-eleven");
    expect(payloadLog).not.toContain("sensitive-access-token");
    expect(payloadLog).not.toContain("sensitive-cert-key");
  });

  it("인증되거나 no-store인 공개 GET 응답 값은 payload 로그에서 제외한다", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SPRING_API_DEBUG_PAYLOAD", "true");
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock
      .mockResolvedValueOnce(Response.json({ data: [{ name: "authenticated-private" }] }))
      .mockResolvedValueOnce(Response.json({ data: [{ name: "no-store-private" }] }));
    vi.stubGlobal("fetch", fetchMock);

    await springFetch({
      path: "/api/v1/items",
      token: "access-token",
      cache: { revalidate: 60 },
      schema: z.object({ data: z.array(z.object({ name: z.string() })) }),
    });
    await springFetch({
      path: "/api/v1/items",
      cache: "no-store",
      schema: z.object({ data: z.array(z.object({ name: z.string() })) }),
    });

    const serializedLogs = JSON.stringify(infoSpy.mock.calls);
    expect(serializedLogs).not.toContain("[spring-api:payload]");
    expect(serializedLogs).not.toContain("authenticated-private");
    expect(serializedLogs).not.toContain("no-store-private");
  });

  it("스키마 검증에 실패한 원본 응답 값은 payload 로그에서 제외한다", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SPRING_API_DEBUG_PAYLOAD", "true");
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(Response.json({ unexpected: "schema-mismatch-secret" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      springFetch({
        path: "/api/v1/news",
        cache: { revalidate: 60 },
        schema: z.array(z.unknown()),
      }),
    ).rejects.toBeInstanceOf(ApiError);

    const serializedLogs = JSON.stringify(infoSpy.mock.calls);
    expect(serializedLogs).not.toContain("[spring-api:payload]");
    expect(serializedLogs).not.toContain("schema-mismatch-secret");
  });

  it("payload 로그의 긴 동적 key와 문자열을 제한한다", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SPRING_API_DEBUG_PAYLOAD", "true");
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const longKey = `dynamic-${"k".repeat(200)}`;
    const longValue = `visible-${"v".repeat(600)}`;
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(Response.json({ [longKey]: longValue }));
    vi.stubGlobal("fetch", fetchMock);

    await springFetch({
      path: "/api/v1/items",
      cache: { revalidate: 60 },
      schema: z.record(z.string(), z.string()),
    });

    const payloadLog = infoSpy.mock.calls
      .map(([message]) => message)
      .find(
        (message) =>
          typeof message === "string" && message.startsWith("[spring-api:payload] GET /api/v1/items"),
      );
    expect(payloadLog).toContain("chars omitted");
    expect(payloadLog).not.toContain(longKey);
    expect(payloadLog).not.toContain(longValue);
  });

  it("인증 API와 Vercel 환경에서는 payload 플래그를 켜도 응답 값을 출력하지 않는다", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("SPRING_API_DEBUG_PAYLOAD", "true");
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock
      .mockResolvedValueOnce(Response.json({ data: [{ title: "preview-secret" }] }))
      .mockResolvedValueOnce(Response.json({ accessToken: "auth-secret" }));
    vi.stubGlobal("fetch", fetchMock);

    await springFetch({
      path: "/api/v1/news",
      cache: { revalidate: 60 },
      schema: z.object({ data: z.array(z.object({ title: z.string() })) }),
    });

    vi.stubEnv("VERCEL_ENV", "");
    await springFetch({
      path: "/api/auth/reissue",
      method: "POST",
      cache: "no-store",
      schema: z.object({ accessToken: z.string() }),
    });

    const serializedLogs = JSON.stringify(infoSpy.mock.calls);
    expect(serializedLogs).not.toContain("[spring-api:payload]");
    expect(serializedLogs).not.toContain("preview-secret");
    expect(serializedLogs).not.toContain("auth-secret");
  });

  it("요청 body 직렬화 오류를 network ApiError로 포장하지 않는다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    const body: { self?: unknown } = {};
    body.self = body;

    await expect(
      springRaw({ path: "/api/v1/reports", method: "POST", body, cache: "no-store" }),
    ).rejects.toBeInstanceOf(TypeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("네트워크 실패를 endpoint가 있는 ApiError로 변환한다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockRejectedValueOnce(new Error("connection refused"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      springRaw({ path: "/api/v1/news", cache: { revalidate: 60 } }),
    ).rejects.toMatchObject({
      name: "ApiError",
      kind: "network",
      status: 0,
      endpoint: "GET /api/v1/news",
    });
  });

  it("실패 응답의 제어 흐름은 HTTP status로만 분기한다", async () => {
    const response = Response.json({ message: "내부 오류 상세" }, { status: 401 });
    const jsonSpy = vi.spyOn(response, "json");
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(response);
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      springFetch({
        path: "/api/v1/items",
        cache: "no-store",
        schema: z.object({ data: z.array(z.unknown()) }),
      }),
    ).rejects.toMatchObject({
      kind: "unauthorized",
      status: 401,
      endpoint: "GET /api/v1/items",
    });
    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it("개발 환경에서 실패 code/message만 제한해 로그한다", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(
      Response.json(
        {
          code: "INVALID_REPORT",
          message: "선택한 동네와 가게를 확인해 주세요.",
          details: "do-not-log-this-detail",
        },
        { status: 400 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      springFetch({ path: "/api/v1/items/46/reports", method: "POST", cache: "no-store" }),
    ).rejects.toMatchObject({ kind: "badRequest", status: 400 });

    const serializedLogs = JSON.stringify(infoSpy.mock.calls);
    expect(serializedLogs).toContain("INVALID_REPORT");
    expect(serializedLogs).toContain("선택한 동네와 가게를 확인해 주세요.");
    expect(serializedLogs).not.toContain("do-not-log-this-detail");
  });

  it("성공 응답을 Zod 스키마로 검증해 반환한다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(Response.json({ id: 7, name: "감자" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      springFetch({
        path: "/api/v1/items/7",
        cache: "no-store",
        schema: z.object({ id: z.number(), name: z.string() }),
      }),
    ).resolves.toEqual({ id: 7, name: "감자" });
  });

  it("성공 본문이 JSON이 아니면 parse 오류로 거부한다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(
      new Response("not-json", { status: 200, headers: { "Content-Type": "application/json" } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      springFetch({ path: "/api/v1/news", cache: "no-store", schema: z.array(z.unknown()) }),
    ).rejects.toMatchObject({
      kind: "parse",
      status: 0,
      endpoint: "GET /api/v1/news",
    });
  });

  it("성공 본문이 스키마와 다르면 parse 오류로 거부한다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(Response.json({ id: "7" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      springFetch({
        path: "/api/v1/items/7",
        cache: "no-store",
        schema: z.object({ id: z.number() }),
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("본문 없는 성공 응답은 schema 없이 void로 처리한다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      springFetch({ path: "/api/v1/items/7/favorite", method: "PUT", cache: "no-store" }),
    ).resolves.toBeUndefined();
  });
});
