import type { Metadata } from "next";
import { cookies } from "next/headers";
import { KAKAO_LOGIN_TRANSITION_COOKIE } from "@/app/_lib/api/auth/kakao-oauth-cookies";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { OnboardingFlow } from "./onboarding-flow";

export const metadata: Metadata = {
  title: "온보딩 | 장보고",
};

interface OnboardingPageProps {
  searchParams: Promise<{
    freshLogin?: string;
    loginError?: string;
    loginDebug?: string;
    onboardingStep?: string;
  }>;
}

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  cancelled: "카카오 로그인을 취소했어요.",
  configuration: "카카오 로그인 설정을 확인하고 있어요. 잠시 후 다시 시도해 주세요.",
  expired: "로그인 요청이 만료됐어요. 다시 시도해 주세요.",
  unavailable: "로그인하지 못했어요. 잠시 후 다시 시도해 주세요.",
};

/** `app/api/auth/kakao/callback`이 실어 보내는 힌트만 인정한다 — `COMPLETED`는 콜백이 홈으로 보내 여기 오지 않는다. */
function parseOnboardingStepHint(value?: string): "NICKNAME" | "REGION" | undefined {
  return value === "NICKNAME" || value === "REGION" ? value : undefined;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const [params, accessToken, cookieStore] = await Promise.all([
    searchParams,
    getAccessToken(),
    cookies(),
  ]);
  const transition = cookieStore.get(KAKAO_LOGIN_TRANSITION_COOKIE)?.value;
  const freshLogin = Boolean(accessToken && params.freshLogin && params.freshLogin === transition);
  return (
    <OnboardingFlow
      freshLogin={freshLogin}
      initialLoginError={params.loginError ? LOGIN_ERROR_MESSAGES[params.loginError] ?? "" : ""}
      initialLoginDebug={params.loginDebug ?? ""}
      isAuthenticated={Boolean(accessToken)}
      onboardingStepHint={parseOnboardingStepHint(params.onboardingStep)}
    />
  );
}
