import { NextResponse } from "next/server";
import {
  createKakaoAuthorizationUrl,
  createOAuthRandomValue,
} from "@/app/_lib/api/auth/kakao-oauth";
import {
  getKakaoOAuthConfig,
  KakaoOAuthConfigError,
} from "@/app/_lib/api/auth/kakao-oauth-config";
import {
  clearKakaoOAuthCookies,
  KAKAO_OAUTH_COOKIE_OPTIONS,
  KAKAO_OAUTH_NONCE_COOKIE,
  KAKAO_OAUTH_STATE_COOKIE,
} from "@/app/_lib/api/auth/kakao-oauth-cookies";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  if (request.headers.get("sec-fetch-site") !== "same-origin") {
    return Response.json({ message: "로그인 요청 출처를 확인할 수 없어요." }, { status: 403 });
  }

  let config;
  try {
    config = getKakaoOAuthConfig();
  } catch (error) {
    const debug = error instanceof KakaoOAuthConfigError ? error.reason : "unknown";
    const location = `/onboarding?loginError=configuration&loginDebug=${encodeURIComponent(debug)}`;
    const response = new NextResponse(null, { status: 303, headers: { Location: location } });
    clearKakaoOAuthCookies(response);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const state = createOAuthRandomValue();
  const nonce = createOAuthRandomValue();
  const response = NextResponse.redirect(createKakaoAuthorizationUrl({ config, state, nonce }));
  response.cookies.set(KAKAO_OAUTH_STATE_COOKIE, state, KAKAO_OAUTH_COOKIE_OPTIONS);
  response.cookies.set(KAKAO_OAUTH_NONCE_COOKIE, nonce, KAKAO_OAUTH_COOKIE_OPTIONS);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
