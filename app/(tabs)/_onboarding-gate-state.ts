import {
  nextOnboardingRoute,
  type OnboardingState,
} from "@/app/_lib/onboarding-store";

export interface OnboardingGateDecision {
  target: string | null;
  shouldBlock: boolean;
}

/** hydration 전에는 화면만 가리고, 실제 저장 상태를 읽은 뒤에만 이동 여부를 정한다. */
export function decideOnboardingGate(
  onboarding: OnboardingState | null,
): OnboardingGateDecision {
  if (!onboarding) {
    return { target: null, shouldBlock: true };
  }

  const target = nextOnboardingRoute(onboarding);
  return { target, shouldBlock: target !== null };
}
