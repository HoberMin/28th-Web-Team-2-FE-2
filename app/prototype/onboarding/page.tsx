import { OnboardingView } from "../_components/onboarding-view";

// F00 온보딩 진입점 — RSC 셸, 실제 인터랙션은 client leaf(OnboardingView)에 위임.
export default function OnboardingPage() {
  return <OnboardingView />;
}
