import "server-only";

import type { NextResponse } from "next/server";

export const KAKAO_OAUTH_STATE_COOKIE = "mg_kakao_oauth_state";
export const KAKAO_OAUTH_NONCE_COOKIE = "mg_kakao_oauth_nonce";
export const KAKAO_LOGIN_TRANSITION_COOKIE = "mg_kakao_login_transition";
export const KAKAO_OAUTH_COOKIE_MAX_AGE = 60 * 10;
export const KAKAO_LOGIN_TRANSITION_MAX_AGE = 30;

export const KAKAO_OAUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth/kakao",
  maxAge: KAKAO_OAUTH_COOKIE_MAX_AGE,
} as const;

export const KAKAO_LOGIN_TRANSITION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/onboarding",
  maxAge: KAKAO_LOGIN_TRANSITION_MAX_AGE,
} as const;

export function clearKakaoOAuthCookies(response: NextResponse): void {
  const expiredOptions = { ...KAKAO_OAUTH_COOKIE_OPTIONS, maxAge: 0 } as const;
  response.cookies.set(KAKAO_OAUTH_STATE_COOKIE, "", expiredOptions);
  response.cookies.set(KAKAO_OAUTH_NONCE_COOKIE, "", expiredOptions);
}
