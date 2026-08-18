import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/app/_lib/api/api-error";
import { MAX_KAKAO_ID_TOKEN_LENGTH } from "@/app/_lib/api/schemas/auth";

const authMocks = vi.hoisted(() => ({
  login: vi.fn(),
  reissue: vi.fn(),
  logout: vi.fn(),
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  saveLoginTokens: vi.fn(),
  saveReissuedTokens: vi.fn(),
  clearTokens: vi.fn(),
}));

vi.mock("@/app/_lib/api/server/auth", () => ({
  login: authMocks.login,
  reissue: authMocks.reissue,
  logout: authMocks.logout,
}));

vi.mock("@/app/_lib/api/auth/session", () => ({
  getAccessToken: authMocks.getAccessToken,
  getRefreshToken: authMocks.getRefreshToken,
  saveLoginTokens: authMocks.saveLoginTokens,
  saveReissuedTokens: authMocks.saveReissuedTokens,
  clearTokens: authMocks.clearTokens,
}));

import { POST as kakaoLogin } from "./kakao/route";
import { POST as logout } from "./logout/route";
import { POST as reissue } from "./reissue/route";

const APP_ORIGIN = "https://app.example.com";

function authRequest(path: string, body?: unknown, origin = APP_ORIGIN): Request {
  const headers = new Headers({ Origin: origin });
  if (body !== undefined) headers.set("Content-Type", "application/json");

  return new Request(`${APP_ORIGIN}${path}`, {
    method: "POST",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("auth Route Handlers", () => {
  beforeEach(() => {
    for (const mock of Object.values(authMocks)) mock.mockReset();
    authMocks.saveLoginTokens.mockResolvedValue(undefined);
    authMocks.saveReissuedTokens.mockResolvedValue(undefined);
    authMocks.clearTokens.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/auth/kakao", () => {
    it("교차 출처 요청을 Spring 호출 전에 거부한다", async () => {
      const response = await kakaoLogin(
        authRequest("/api/auth/kakao", { idToken: "id-token" }, "https://attacker.example"),
      );

      expect(response.status).toBe(403);
      expect(authMocks.login).not.toHaveBeenCalled();
      expect(authMocks.saveLoginTokens).not.toHaveBeenCalled();
    });

    it.each([
      ["빈 값", ""],
      ["공백", "   "],
      ["최대 길이 초과", "a".repeat(MAX_KAKAO_ID_TOKEN_LENGTH + 1)],
    ])("%s idToken을 Spring 호출 전에 거부한다", async (_case, idToken) => {
      const response = await kakaoLogin(authRequest("/api/auth/kakao", { idToken }));

      expect(response.status).toBe(400);
      expect(authMocks.login).not.toHaveBeenCalled();
    });

    it("로그인 성공 시 토큰을 쿠키 저장소에만 넘기고 본문에는 노출하지 않는다", async () => {
      const tokens = { accessToken: "service-access", refreshToken: "service-refresh" };
      authMocks.login.mockResolvedValueOnce(tokens);

      const response = await kakaoLogin(
        authRequest("/api/auth/kakao", { idToken: "header.payload.signature" }),
      );
      const body = await response.text();

      expect(response.status).toBe(200);
      expect(JSON.parse(body) as unknown).toEqual({ ok: true });
      expect(body).not.toContain(tokens.accessToken);
      expect(body).not.toContain(tokens.refreshToken);
      expect(authMocks.saveLoginTokens).toHaveBeenCalledWith(tokens);
    });

    it.each([
      [401, "unauthorized", 401],
      [400, "badRequest", 400],
      [503, "upstream", 502],
    ] as const)("Spring %i(%s) 오류를 기존 BFF status %i 의미로 유지한다", async (status, kind, expected) => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      authMocks.login.mockRejectedValueOnce(
        new ApiError({ kind, status, endpoint: "POST /api/auth/kakao/login" }),
      );

      const response = await kakaoLogin(
        authRequest("/api/auth/kakao", { idToken: "header.payload.signature" }),
      );

      expect(response.status).toBe(expected);
      expect(authMocks.saveLoginTokens).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/reissue", () => {
    it("교차 출처 요청을 쿠키 읽기 전에 거부한다", async () => {
      const response = await reissue(
        authRequest("/api/auth/reissue", undefined, "https://attacker.example"),
      );

      expect(response.status).toBe(403);
      expect(authMocks.getRefreshToken).not.toHaveBeenCalled();
    });

    it("refreshToken이 없으면 재로그인 401을 반환한다", async () => {
      authMocks.getRefreshToken.mockResolvedValueOnce(undefined);

      const response = await reissue(authRequest("/api/auth/reissue"));

      expect(response.status).toBe(401);
      expect(authMocks.reissue).not.toHaveBeenCalled();
    });

    it("재발급 성공 시 토큰을 쿠키 저장소에만 넘기고 본문에는 노출하지 않는다", async () => {
      const tokens = { accessToken: "renewed-access", refreshToken: "renewed-refresh" };
      authMocks.getRefreshToken.mockResolvedValueOnce("stored-refresh");
      authMocks.reissue.mockResolvedValueOnce(tokens);

      const response = await reissue(authRequest("/api/auth/reissue"));
      const body = await response.text();

      expect(response.status).toBe(200);
      expect(JSON.parse(body) as unknown).toEqual({ ok: true });
      expect(body).not.toContain(tokens.accessToken);
      expect(body).not.toContain(tokens.refreshToken);
      expect(authMocks.saveReissuedTokens).toHaveBeenCalledWith(tokens);
    });

    it("통신 실패에는 세션을 보존하고 503을 반환한다", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      authMocks.getRefreshToken.mockResolvedValueOnce("stored-refresh");
      authMocks.reissue.mockRejectedValueOnce(
        new ApiError({ kind: "network", status: 0, endpoint: "POST /api/auth/reissue" }),
      );

      const response = await reissue(authRequest("/api/auth/reissue"));

      expect(response.status).toBe(503);
      expect(authMocks.clearTokens).not.toHaveBeenCalled();
    });

    it("인증 거절에는 세션을 지우고 401을 반환한다", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      authMocks.getRefreshToken.mockResolvedValueOnce("stored-refresh");
      authMocks.reissue.mockRejectedValueOnce(
        new ApiError({ kind: "unauthorized", status: 401, endpoint: "POST /api/auth/reissue" }),
      );

      const response = await reissue(authRequest("/api/auth/reissue"));

      expect(response.status).toBe(401);
      expect(authMocks.clearTokens).toHaveBeenCalledOnce();
    });
  });

  describe("POST /api/auth/logout", () => {
    it("교차 출처 요청을 쿠키 읽기 전에 거부한다", async () => {
      const response = await logout(
        authRequest("/api/auth/logout", undefined, "https://attacker.example"),
      );

      expect(response.status).toBe(403);
      expect(authMocks.getAccessToken).not.toHaveBeenCalled();
      expect(authMocks.getRefreshToken).not.toHaveBeenCalled();
    });

    it("같은 출처 요청은 Spring 세션과 로컬 쿠키를 종료한다", async () => {
      authMocks.getAccessToken.mockResolvedValueOnce("service-access");
      authMocks.getRefreshToken.mockResolvedValueOnce("service-refresh");
      authMocks.logout.mockResolvedValueOnce(undefined);

      const response = await logout(authRequest("/api/auth/logout"));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ ok: true });
      expect(authMocks.logout).toHaveBeenCalledWith({
        accessToken: "service-access",
        refreshToken: "service-refresh",
      });
      expect(authMocks.clearTokens).toHaveBeenCalledOnce();
    });
  });
});
