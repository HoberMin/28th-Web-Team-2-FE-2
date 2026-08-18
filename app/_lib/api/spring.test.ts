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

  it("실패 응답 본문을 파싱하지 않고 HTTP status로만 분기한다", async () => {
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
