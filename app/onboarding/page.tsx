import type { Metadata } from "next";
import { cookies } from "next/headers";
import { KAKAO_LOGIN_TRANSITION_COOKIE } from "@/app/_lib/api/auth/kakao-oauth-cookies";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getMe } from "@/app/_lib/api/server/users";
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

/** 콜백이 실어 보내는 쿼리 힌트 — `getMe` 조회가 실패했을 때만 쓰는 폴백이다(아래 참고). */
function parseOnboardingStepHint(value?: string): "NICKNAME" | "REGION" | undefined {
  return value === "NICKNAME" || value === "REGION" ? value : undefined;
}

/**
 * 온보딩 단계·닉네임의 정본을 서버에서 직접 확인한다.
 *
 * 콜백이 실어 보내는 `?onboardingStep=` 쿼리는 사용자가 직접 조작할 수 있어(예: URL을 손으로
 * 쳐서 `REGION`으로 바꾸면 닉네임 단계를 건너뛸 수 있었다) 화면 분기의 근거로 쓰지 않는다.
 * `accessToken`이 이미 여기 있으니 `getMe`로 실제 값을 확인하는 쪽이 위조 불가능하고,
 * 닉네임까지 같이 받아서 로컬 스토어가 "이웃"으로 표시되는 문제도 같이 없앤다.
 * 조회 자체가 실패하면(네트워크 등) 쿼리 힌트로 폴백한다 — 이 조회 실패가 온보딩 진입을
 * 막으면 안 된다.
 */
async function resolveOnboardingState(
  accessToken: string | undefined,
  queryHint?: string,
): Promise<{ step: "NICKNAME" | "REGION" | undefined; nickname: string | undefined }> {
  if (!accessToken) return { step: undefined, nickname: undefined };
  try {
    const me = await getMe(accessToken);
    return {
      step: me.onboardingStep === "COMPLETED" ? undefined : me.onboardingStep,
      nickname: me.nickname ?? undefined,
    };
  } catch {
    return { step: parseOnboardingStepHint(queryHint), nickname: undefined };
  }
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const [params, accessToken, cookieStore] = await Promise.all([
    searchParams,
    getAccessToken(),
    cookies(),
  ]);
  const transition = cookieStore.get(KAKAO_LOGIN_TRANSITION_COOKIE)?.value;
  const freshLogin = Boolean(accessToken && params.freshLogin && params.freshLogin === transition);
  const { step, nickname } = await resolveOnboardingState(accessToken, params.onboardingStep);
  return (
    <OnboardingFlow
      freshLogin={freshLogin}
      initialLoginError={params.loginError ? LOGIN_ERROR_MESSAGES[params.loginError] ?? "" : ""}
      initialLoginDebug={params.loginDebug ?? ""}
      isAuthenticated={Boolean(accessToken)}
      onboardingStepHint={step}
      serverNickname={nickname}
    />
  );
}
