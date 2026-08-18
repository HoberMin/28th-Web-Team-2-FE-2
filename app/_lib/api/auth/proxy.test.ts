import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import {
  ACCESS_TOKEN_COOKIE,
  REISSUE_BACKOFF_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "./tokens";

function tokenWithExpiry(exp: number): string {
  const payload = btoa(JSON.stringify({ exp }))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `header.${payload}.signature`;
}

function sessionRequest(params: {
  accessToken?: string;
  refreshToken?: string;
  backoff?: boolean;
}): NextRequest {
  const cookies = [
    params.accessToken ? `${ACCESS_TOKEN_COOKIE}=${params.accessToken}` : null,
    params.refreshToken ? `${REFRESH_TOKEN_COOKIE}=${params.refreshToken}` : null,
    params.backoff ? `${REISSUE_BACKOFF_COOKIE}=1` : null,
  ].filter((value): value is string => value !== null);

  return new NextRequest("https://app.example.com/prices", {
    headers: cookies.length > 0 ? { Cookie: cookies.join("; ") } : undefined,
  });
}

describe("auth proxy", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("만료 여유가 있는 accessToken은 재발급하지 않는다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    const now = Math.floor(Date.now() / 1_000);

    await proxy(
      sessionRequest({
        accessToken: tokenWithExpiry(now + 3_600),
        refreshToken: "stored-refresh",
      }),
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("재발급 upstream 요청에 검증된 URL과 timeout signal을 사용한다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(
      Response.json(
        { accessToken: "renewed-access" },
        { headers: { "Set-Cookie": "refreshToken=renewed-refresh; Path=/; HttpOnly" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const request = sessionRequest({ accessToken: "invalid", refreshToken: "stored-refresh" });
    const response = await proxy(request);

    const [input, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(input)).toBe("https://api.marketgo.kro.kr/api/auth/reissue");
    expect(init).toMatchObject({
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Cookie: "refreshToken=stored-refresh",
      },
    });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value).toBe("renewed-access");
    expect(request.cookies.get(REFRESH_TOKEN_COOKIE)?.value).toBe("renewed-refresh");
    expect(response.cookies.get(ACCESS_TOKEN_COOKIE)?.value).toBe("renewed-access");
    expect(response.cookies.get(REFRESH_TOKEN_COOKIE)?.value).toBe("renewed-refresh");
  });

  it("재발급 응답에 refresh 쿠키가 없으면 기존 refresh를 유지한다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(Response.json({ accessToken: "renewed-access" }));
    vi.stubGlobal("fetch", fetchMock);

    const request = sessionRequest({ accessToken: "invalid", refreshToken: "stored-refresh" });
    const response = await proxy(request);

    expect(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value).toBe("renewed-access");
    expect(request.cookies.get(REFRESH_TOKEN_COOKIE)?.value).toBe("stored-refresh");
    expect(response.cookies.get(ACCESS_TOKEN_COOKIE)?.value).toBe("renewed-access");
    expect(response.cookies.get(REFRESH_TOKEN_COOKIE)).toBeUndefined();
    expect(
      response.headers
        .getSetCookie()
        .some((header) => header.startsWith(`${REFRESH_TOKEN_COOKIE}=`)),
    ).toBe(false);
  });

  it("timeout이면 세션을 지우지 않고 재발급 백오프를 설정한다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockRejectedValueOnce(new DOMException("timed out", "TimeoutError"));
    vi.stubGlobal("fetch", fetchMock);

    const request = sessionRequest({ accessToken: "invalid", refreshToken: "stored-refresh" });
    const response = await proxy(request);

    expect(request.cookies.get(REFRESH_TOKEN_COOKIE)?.value).toBe("stored-refresh");
    expect(response.cookies.get(REISSUE_BACKOFF_COOKIE)?.value).toBe("1");
    expect(response.cookies.get(REFRESH_TOKEN_COOKIE)).toBeUndefined();
  });

  it("401이면 요청과 응답의 access·refresh 쿠키를 모두 제거한다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(Response.json({ message: "expired" }, { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    const request = sessionRequest({ accessToken: "invalid", refreshToken: "stored-refresh" });
    const response = await proxy(request);

    expect(request.cookies.get(ACCESS_TOKEN_COOKIE)).toBeUndefined();
    expect(request.cookies.get(REFRESH_TOKEN_COOKIE)).toBeUndefined();
    expect(response.headers.get("set-cookie")).toContain(`${ACCESS_TOKEN_COOKIE}=`);
    expect(response.headers.get("set-cookie")).toContain(`${REFRESH_TOKEN_COOKIE}=`);
  });

  it("안전하지 않은 base URL 설정은 통신 실패로 숨기지 않고 거부한다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("SPRING_API_BASE_URL", "http://user:password@api.example.com/v1");
    const request = sessionRequest({ accessToken: "invalid", refreshToken: "stored-refresh" });

    await expect(proxy(request)).rejects.toThrow("SPRING_API_BASE_URL");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
