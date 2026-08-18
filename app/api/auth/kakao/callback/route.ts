import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/app/_lib/api/api-error";
import { saveLoginTokens } from "@/app/_lib/api/auth/session";
import {
  createOAuthRandomValue,
  exchangeKakaoCode,
  KakaoOAuthError,
  verifyKakaoIdToken,
} from "@/app/_lib/api/auth/kakao-oauth";
import {
  getKakaoOAuthConfig,
  KakaoOAuthConfigError,
} from "@/app/_lib/api/auth/kakao-oauth-config";
import {
  clearKakaoOAuthCookies,
  KAKAO_LOGIN_TRANSITION_COOKIE,
  KAKAO_LOGIN_TRANSITION_COOKIE_OPTIONS,
  KAKAO_OAUTH_NONCE_COOKIE,
  KAKAO_OAUTH_STATE_COOKIE,
} from "@/app/_lib/api/auth/kakao-oauth-cookies";
import { login } from "@/app/_lib/api/server/auth";

export const dynamic = "force-dynamic";

type LoginErrorCode = "cancelled" | "configuration" | "expired" | "unavailable";

function onboardingRedirect(
  params: { error?: LoginErrorCode; freshLogin?: string; debug?: string } = {},
) {
  const searchParams = new URLSearchParams();
  if (params.error) searchParams.set("loginError", params.error);
  if (params.debug) searchParams.set("loginDebug", params.debug);
  if (params.freshLogin) searchParams.set("freshLogin", params.freshLogin);
  const query = searchParams.toString();
  const location = query ? `/onboarding?${query}` : "/onboarding";
  const response = new NextResponse(null, { status: 303, headers: { Location: location } });
  clearKakaoOAuthCookies(response);
  if (params.freshLogin) {
    response.cookies.set(
      KAKAO_LOGIN_TRANSITION_COOKIE,
      params.freshLogin,
      KAKAO_LOGIN_TRANSITION_COOKIE_OPTIONS,
    );
  }
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function GET(request: NextRequest): Promise<Response> {
  let config;
  try {
    config = getKakaoOAuthConfig();
  } catch (error) {
    const debug = error instanceof KakaoOAuthConfigError ? error.reason : "unknown";
    return onboardingRedirect({ error: "configuration", debug });
  }

  if (
    request.nextUrl.origin !== config.redirectUri.origin ||
    request.nextUrl.pathname !== config.redirectUri.pathname
  ) {
    return onboardingRedirect({ error: "configuration" });
  }

  const returnedState = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get(KAKAO_OAUTH_STATE_COOKIE)?.value;
  const storedNonce = request.cookies.get(KAKAO_OAUTH_NONCE_COOKIE)?.value;
  if (!returnedState || !storedState || !storedNonce || returnedState !== storedState) {
    return onboardingRedirect({ error: "expired" });
  }

  if (request.nextUrl.searchParams.has("error")) {
    return onboardingRedirect({ error: "cancelled" });
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return onboardingRedirect({ error: "expired" });
  }

  try {
    const idToken = await exchangeKakaoCode({ code, config });
    await verifyKakaoIdToken({ config, idToken, nonce: storedNonce });
    const tokens = await login({ provider: "kakao", idToken });
    await saveLoginTokens(tokens);
    return onboardingRedirect({ freshLogin: createOAuthRandomValue() });
  } catch (error) {
    if (error instanceof KakaoOAuthError) {
      console.error("[auth] 카카오 OAuth 처리 실패", { kind: error.kind });
      return onboardingRedirect({ error: "unavailable" });
    }
    if (error instanceof ApiError) {
      console.error("[auth] 서비스 로그인 실패", {
        endpoint: error.endpoint,
        kind: error.kind,
        status: error.status,
      });
      return onboardingRedirect({ error: "unavailable" });
    }
    throw error;
  }
}
