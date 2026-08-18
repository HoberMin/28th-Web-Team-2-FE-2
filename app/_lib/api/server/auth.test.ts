import { beforeEach, describe, expect, it, vi } from "vitest";

const springRawMock = vi.hoisted(() => vi.fn());

vi.mock("../spring", () => ({ springRaw: springRawMock }));

import { login, logout, reissue } from "./auth";

describe("auth server API", () => {
  beforeEach(() => {
    springRawMock.mockReset();
  });

  it("카카오 idToken을 no-store POST로 전달하고 서비스 토큰을 읽는다", async () => {
    springRawMock.mockResolvedValueOnce(
      Response.json(
        { accessToken: "service-access" },
        {
          headers: {
            "Set-Cookie": "refreshToken=service-refresh; Path=/; HttpOnly; SameSite=Lax",
          },
        },
      ),
    );

    await expect(login({ provider: "kakao", idToken: "kakao-id-token" })).resolves.toEqual({
      accessToken: "service-access",
      refreshToken: "service-refresh",
    });
    expect(springRawMock).toHaveBeenCalledWith({
      path: "/api/auth/kakao/login",
      method: "POST",
      body: { idToken: "kakao-id-token" },
      cache: "no-store",
    });
  });

  it("refreshToken을 Spring 쿠키 이름으로 중계한다", async () => {
    springRawMock.mockResolvedValueOnce(Response.json({ accessToken: "renewed-access" }));

    await expect(reissue("stored-refresh")).resolves.toEqual({
      accessToken: "renewed-access",
      refreshToken: null,
    });
    expect(springRawMock).toHaveBeenCalledWith({
      path: "/api/auth/reissue",
      method: "POST",
      cookie: "refreshToken=stored-refresh",
      cache: "no-store",
    });
  });

  it("Spring 인증 실패를 status 기반 ApiError로 전달한다", async () => {
    springRawMock.mockResolvedValueOnce(Response.json({ message: "ignored" }, { status: 401 }));

    await expect(login({ provider: "kakao", idToken: "expired-id-token" })).rejects.toMatchObject({
      kind: "unauthorized",
      status: 401,
      endpoint: "POST /api/auth/kakao/login",
    });
  });

  it("성공 응답에 accessToken이 없으면 parse 오류로 거부한다", async () => {
    springRawMock.mockResolvedValueOnce(Response.json({ token: "wrong-field" }));

    await expect(reissue("stored-refresh")).rejects.toMatchObject({
      kind: "parse",
      status: 0,
      endpoint: "POST /api/auth/reissue",
    });
  });

  it("로그아웃 요청에 accessToken과 refreshToken을 함께 전달한다", async () => {
    springRawMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(
      logout({ accessToken: "service-access", refreshToken: "service-refresh" }),
    ).resolves.toBeUndefined();
    expect(springRawMock).toHaveBeenCalledWith({
      path: "/api/auth/logout",
      method: "POST",
      token: "service-access",
      cookie: "refreshToken=service-refresh",
      cache: "no-store",
    });
  });

  it("Spring 로그아웃 통신 실패가 로컬 로그아웃을 막지 않게 삼킨다", async () => {
    springRawMock.mockRejectedValueOnce(new Error("backend unavailable"));

    await expect(
      logout({ accessToken: "service-access", refreshToken: "service-refresh" }),
    ).resolves.toBeUndefined();
  });
});
