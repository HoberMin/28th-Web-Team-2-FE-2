import "server-only";

import { z } from "zod";

export const KAKAO_CALLBACK_PATH = "/api/auth/kakao/callback";

export interface KakaoOAuthConfig {
  clientSecret: string;
  redirectUri: URL;
  restKey: string;
}

const envSchema = z.object({
  KAKAO_CLIENT_SECRET: z.string().trim().min(1),
  KAKAO_REDIRECT_URI: z.string().trim().min(1),
  KAKAO_REST_KEY: z.string().trim().min(1),
});

function validatedRedirectUri(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("KAKAO_REDIRECT_URI가 올바른 URL이 아닙니다.");
  }

  const isLocalHttp = url.protocol === "http:" && url.hostname === "localhost";
  if (url.protocol !== "https:" && !isLocalHttp) {
    throw new Error("KAKAO_REDIRECT_URI는 HTTPS 또는 localhost HTTP여야 합니다.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("KAKAO_REDIRECT_URI에는 인증정보·쿼리·해시를 넣을 수 없습니다.");
  }
  if (url.pathname !== KAKAO_CALLBACK_PATH) {
    throw new Error(`KAKAO_REDIRECT_URI 경로는 ${KAKAO_CALLBACK_PATH}여야 합니다.`);
  }
  return url;
}

export function getKakaoOAuthConfig(): KakaoOAuthConfig {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // 값 자체는 절대 안 찍는다 — 어떤 키가 비어있는지(이름)만 남긴다.
    console.error("[auth] 카카오 OAuth 환경변수 누락", {
      missing: parsed.error.issues.map((issue) => issue.path.join(".")),
    });
    throw new Error("카카오 로그인 서버 환경값이 설정되지 않았습니다.");
  }

  try {
    return {
      clientSecret: parsed.data.KAKAO_CLIENT_SECRET,
      redirectUri: validatedRedirectUri(parsed.data.KAKAO_REDIRECT_URI),
      restKey: parsed.data.KAKAO_REST_KEY,
    };
  } catch (error) {
    console.error("[auth] 카카오 OAuth redirect URI 검증 실패", {
      reason: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
