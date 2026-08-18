import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { ApiError } from "@/app/_lib/api/api-error";
import {
  KAKAO_LOGIN_TRANSITION_COOKIE,
  KAKAO_OAUTH_NONCE_COOKIE,
  KAKAO_OAUTH_STATE_COOKIE,
} from "@/app/_lib/api/auth/kakao-oauth-cookies";

const mocks = vi.hoisted(() => ({
  createKakaoAuthorizationUrl: vi.fn(),
  createOAuthRandomValue: vi.fn(),
  exchangeKakaoCode: vi.fn(),
  getKakaoOAuthConfig: vi.fn(),
  login: vi.fn(),
  saveLoginTokens: vi.fn(),
  verifyKakaoIdToken: vi.fn(),
}));

vi.mock("@/app/_lib/api/auth/kakao-oauth", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/app/_lib/api/auth/kakao-oauth")>();
  return {
    ...original,
    createKakaoAuthorizationUrl: mocks.createKakaoAuthorizationUrl,
    createOAuthRandomValue: mocks.createOAuthRandomValue,
    exchangeKakaoCode: mocks.exchangeKakaoCode,
    verifyKakaoIdToken: mocks.verifyKakaoIdToken,
  };
});

vi.mock("@/app/_lib/api/auth/kakao-oauth-config", () => ({
  getKakaoOAuthConfig: mocks.getKakaoOAuthConfig,
}));
vi.mock("@/app/_lib/api/server/auth", () => ({ login: mocks.login }));
vi.mock("@/app/_lib/api/auth/session", () => ({ saveLoginTokens: mocks.saveLoginTokens }));

import { GET as callback } from "./callback/route";
import { GET as start } from "./start/route";

const config = {
  clientSecret: "client-secret",
  redirectUri: new URL("http://localhost:3000/api/auth/kakao/callback"),
  restKey: "rest-key",
};

function callbackRequest(query: string, cookies?: Record<string, string>): NextRequest {
  const headers = new Headers();
  if (cookies) {
    headers.set("Cookie", Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join("; "));
  }
  return new NextRequest(`http://localhost:3000/api/auth/kakao/callback?${query}`, { headers });
}

describe("Kakao OAuth routes", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.getKakaoOAuthConfig.mockReturnValue(config);
    mocks.createKakaoAuthorizationUrl.mockReturnValue(
      new URL("https://kauth.kakao.com/oauth/authorize?client_id=rest-key&state=state&nonce=nonce"),
    );
    mocks.verifyKakaoIdToken.mockResolvedValue(undefined);
    mocks.saveLoginTokens.mockResolvedValue(undefined);
  });

  it("start는 일회용 state·nonce를 httpOnly 쿠키에 저장한 뒤 카카오로 이동한다", async () => {
    mocks.createOAuthRandomValue.mockReturnValueOnce("state").mockReturnValueOnce("nonce");

    const response = await start(
      new Request("http://localhost:3000/api/auth/kakao/start", {
        headers: { "Sec-Fetch-Site": "same-origin" },
      }),
    );
    const setCookies = response.headers.getSetCookie().join("\n");

    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toContain("https://kauth.kakao.com/oauth/authorize");
    expect(setCookies).toContain(`${KAKAO_OAUTH_STATE_COOKIE}=state`);
    expect(setCookies).toContain(`${KAKAO_OAUTH_NONCE_COOKIE}=nonce`);
    expect(setCookies).toContain("HttpOnly");
    expect(setCookies).toContain("SameSite=lax");
    expect(setCookies).toContain("Path=/api/auth/kakao");
  });

  it("cross-site top-level GET은 state·nonce를 덮어쓰기 전에 거부한다", async () => {
    const response = await start(
      new Request("http://localhost:3000/api/auth/kakao/start", {
        headers: { "Sec-Fetch-Site": "cross-site" },
      }),
    );

    expect(response.status).toBe(403);
    expect(mocks.getKakaoOAuthConfig).not.toHaveBeenCalled();
    expect(mocks.createOAuthRandomValue).not.toHaveBeenCalled();
  });

  it("state가 다르면 code 교환 전에 요청을 폐기한다", async () => {
    const response = await callback(
      callbackRequest("code=code&state=attacker-state", {
        [KAKAO_OAUTH_STATE_COOKIE]: "stored-state",
        [KAKAO_OAUTH_NONCE_COOKIE]: "stored-nonce",
      }),
    );

    expect(response.headers.get("Location")).toBe("/onboarding?loginError=expired");
    expect(mocks.exchangeKakaoCode).not.toHaveBeenCalled();
    expect(response.headers.getSetCookie().join("\n")).toContain("Max-Age=0");
  });

  it("성공 시 검증된 ID token만 Spring에 넘기고 서비스 토큰은 쿠키 저장소로 보낸다", async () => {
    const tokens = { accessToken: "service-access", refreshToken: "service-refresh" };
    mocks.exchangeKakaoCode.mockResolvedValueOnce("header.payload.signature");
    mocks.createOAuthRandomValue.mockReturnValueOnce("login-transition");
    mocks.login.mockResolvedValueOnce(tokens);

    const response = await callback(
      callbackRequest("code=authorization-code&state=stored-state", {
        [KAKAO_OAUTH_STATE_COOKIE]: "stored-state",
        [KAKAO_OAUTH_NONCE_COOKIE]: "stored-nonce",
      }),
    );
    const responseText = await response.text();

    expect(mocks.exchangeKakaoCode).toHaveBeenCalledWith({ code: "authorization-code", config });
    expect(mocks.verifyKakaoIdToken).toHaveBeenCalledWith({
      config,
      idToken: "header.payload.signature",
      nonce: "stored-nonce",
    });
    expect(mocks.login).toHaveBeenCalledWith({ provider: "kakao", idToken: "header.payload.signature" });
    expect(mocks.saveLoginTokens).toHaveBeenCalledWith(tokens);
    expect(response.headers.get("Location")).toBe("/onboarding?freshLogin=login-transition");
    expect(response.headers.getSetCookie().join("\n")).toContain(
      `${KAKAO_LOGIN_TRANSITION_COOKIE}=login-transition`,
    );
    expect(responseText).not.toContain(tokens.accessToken);
    expect(responseText).not.toContain(tokens.refreshToken);
  });

  it("카카오 취소는 code 교환 없이 안전한 오류 코드로 복귀한다", async () => {
    const response = await callback(
      callbackRequest("error=access_denied&error_description=private-detail&state=stored-state", {
        [KAKAO_OAUTH_STATE_COOKIE]: "stored-state",
        [KAKAO_OAUTH_NONCE_COOKIE]: "stored-nonce",
      }),
    );

    expect(response.headers.get("Location")).toBe("/onboarding?loginError=cancelled");
    expect(response.headers.get("Location")).not.toContain("private-detail");
    expect(mocks.exchangeKakaoCode).not.toHaveBeenCalled();
  });

  it("state 없는 오류 callback도 취소로 신뢰하지 않고 만료 처리한다", async () => {
    const response = await callback(callbackRequest("error=access_denied"));

    expect(response.headers.get("Location")).toBe("/onboarding?loginError=expired");
    expect(mocks.exchangeKakaoCode).not.toHaveBeenCalled();
  });

  it("Spring 인증 실패는 토큰을 저장하지 않고 일반 오류로 복귀한다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.exchangeKakaoCode.mockResolvedValueOnce("header.payload.signature");
    mocks.login.mockRejectedValueOnce(
      new ApiError({ kind: "unauthorized", status: 401, endpoint: "POST /api/auth/kakao/login" }),
    );

    const response = await callback(
      callbackRequest("code=authorization-code&state=stored-state", {
        [KAKAO_OAUTH_STATE_COOKIE]: "stored-state",
        [KAKAO_OAUTH_NONCE_COOKIE]: "stored-nonce",
      }),
    );

    expect(response.headers.get("Location")).toBe("/onboarding?loginError=unavailable");
    expect(mocks.saveLoginTokens).not.toHaveBeenCalled();
  });
});
