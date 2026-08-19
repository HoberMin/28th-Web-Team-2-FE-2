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
import { getMe } from "@/app/_lib/api/server/users";
import { ROUTES } from "@/app/_lib/routes";

export const dynamic = "force-dynamic";

type LoginErrorCode = "cancelled" | "configuration" | "expired" | "unavailable";

/** `getMe` 응답의 `onboardingStep` 중 온보딩 화면이 이어서 진행할 단계만 — `COMPLETED`는 홈으로 보내 여기 오지 않는다. */
type OnboardingStepHint = "NICKNAME" | "REGION";

function baseRedirect(location: string): NextResponse {
  const response = new NextResponse(null, { status: 303, headers: { Location: location } });
  clearKakaoOAuthCookies(response);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

function onboardingRedirect(
  params: {
    error?: LoginErrorCode;
    freshLogin?: string;
    debug?: string;
    onboardingStep?: OnboardingStepHint;
  } = {},
) {
  const searchParams = new URLSearchParams();
  if (params.error) searchParams.set("loginError", params.error);
  if (params.debug) searchParams.set("loginDebug", params.debug);
  if (params.freshLogin) searchParams.set("freshLogin", params.freshLogin);
  if (params.onboardingStep) searchParams.set("onboardingStep", params.onboardingStep);
  const query = searchParams.toString();
  const location = query ? `/onboarding?${query}` : "/onboarding";
  const response = baseRedirect(location);
  if (params.freshLogin) {
    response.cookies.set(
      KAKAO_LOGIN_TRANSITION_COOKIE,
      params.freshLogin,
      KAKAO_LOGIN_TRANSITION_COOKIE_OPTIONS,
    );
  }
  return response;
}

/** 온보딩을 이미 마친 사용자(`onboardingStep === "COMPLETED"`) 전용 — 그대로 홈으로 보낸다. */
function homeRedirect(): NextResponse {
  return baseRedirect(ROUTES.home);
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

    // 재방문자가 매번 닉네임부터 다시 시작하지 않도록 온보딩 진행 단계를 서버에 확인한다.
    // 이 조회가 실패해도(네트워크 오류 등) 로그인 자체는 이미 성공했으니 핵심 흐름을 막지
    // 않는다 — 기존 동작(그냥 /onboarding)으로 폴백한다.
    try {
      const me = await getMe(tokens.accessToken);
      if (me.onboardingStep === "COMPLETED") {
        return homeRedirect();
      }
      return onboardingRedirect({
        freshLogin: createOAuthRandomValue(),
        onboardingStep: me.onboardingStep,
      });
    } catch (meError) {
      console.error("[auth] 온보딩 진행 단계 조회 실패 — /onboarding으로 폴백", {
        kind: meError instanceof ApiError ? meError.kind : "unknown",
      });
      return onboardingRedirect({ freshLogin: createOAuthRandomValue() });
    }
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
