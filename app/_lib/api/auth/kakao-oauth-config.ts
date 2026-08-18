import "server-only";

import { z } from "zod";

export const KAKAO_CALLBACK_PATH = "/api/auth/kakao/callback";

export interface KakaoOAuthConfig {
  clientSecret: string;
  redirectUri: URL;
  restKey: string;
}

/**
 * 값은 절대 담지 않는다 — 어떤 env var가 비었는지(키 이름) 또는 어떤 형식 규칙을
 * 어겼는지(고정 문구)만 담는다. 이 reason은 로그인 실패 리다이렉트의 쿼리로도 나간다
 * (Vercel 로그 접근 권한이 없는 사람도 브라우저 콘솔에서 원인을 볼 수 있게 하기 위해서다).
 */
export class KakaoOAuthConfigError extends Error {
  readonly reason: string;

  constructor(reason: string) {
    super("카카오 로그인 서버 환경값이 올바르지 않습니다.");
    this.name = "KakaoOAuthConfigError";
    this.reason = reason;
  }
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
    const missing = parsed.error.issues.map((issue) => issue.path.join("."));
    console.error("[auth] 카카오 OAuth 환경변수 누락", { missing });
    throw new KakaoOAuthConfigError(`missing:${missing.join(",")}`);
  }

  let redirectUri: URL;
  try {
    redirectUri = validatedRedirectUri(parsed.data.KAKAO_REDIRECT_URI);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error("[auth] 카카오 OAuth redirect URI 검증 실패", { reason });
    throw new KakaoOAuthConfigError(reason);
  }

  return {
    clientSecret: parsed.data.KAKAO_CLIENT_SECRET,
    redirectUri,
    restKey: parsed.data.KAKAO_REST_KEY,
  };
}
