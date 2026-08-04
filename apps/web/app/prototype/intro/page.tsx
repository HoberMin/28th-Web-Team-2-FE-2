import { IntroView } from "../_components/intro-view";

// F00-0 서비스 소개 · 로그인 진입점 — RSC 셸, 인터랙션은 client leaf(IntroView)에 위임.
// 앱 첫 실행 시 홈 게이트(onboarding-gate.tsx)가 이리로 보낸다.
export default function IntroPage() {
  return <IntroView />;
}
