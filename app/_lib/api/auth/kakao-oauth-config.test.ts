import { afterEach, describe, expect, it, vi } from "vitest";
import { getKakaoOAuthConfig } from "./kakao-oauth-config";

describe("Kakao OAuth config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("서버 환경값과 정확한 localhost callback을 허용한다", () => {
    vi.stubEnv("KAKAO_REST_KEY", "rest-key");
    vi.stubEnv("KAKAO_CLIENT_SECRET", "client-secret");
    vi.stubEnv("KAKAO_REDIRECT_URI", "http://localhost:3000/api/auth/kakao/callback");

    expect(getKakaoOAuthConfig()).toEqual({
      restKey: "rest-key",
      clientSecret: "client-secret",
      redirectUri: new URL("http://localhost:3000/api/auth/kakao/callback"),
    });
  });

  it.each([
    ["HTTP 외부 호스트", "http://example.com/api/auth/kakao/callback"],
    ["다른 callback 경로", "https://example.com/oauth/callback"],
    ["쿼리 포함", "https://example.com/api/auth/kakao/callback?next=/"],
    ["인증정보 포함", "https://user:pass@example.com/api/auth/kakao/callback"],
  ])("%s redirect URI를 거부한다", (_case, redirectUri) => {
    vi.stubEnv("KAKAO_REST_KEY", "rest-key");
    vi.stubEnv("KAKAO_CLIENT_SECRET", "client-secret");
    vi.stubEnv("KAKAO_REDIRECT_URI", redirectUri);

    expect(() => getKakaoOAuthConfig()).toThrow();
  });

  it("필수 서버 환경값이 없으면 설정 오류로 중단한다", () => {
    vi.stubEnv("KAKAO_REST_KEY", "");
    vi.stubEnv("KAKAO_CLIENT_SECRET", "");
    vi.stubEnv("KAKAO_REDIRECT_URI", "");

    expect(() => getKakaoOAuthConfig()).toThrow("카카오 로그인 서버 환경값");
  });
});
