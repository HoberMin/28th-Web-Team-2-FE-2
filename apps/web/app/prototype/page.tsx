import { PhoneFrame, Scroll } from "./_lib/shell";
import { GNB } from "./_components/gnb";
import { HomeVegetables } from "./_components/home-vegetables";
import { LocationLabel } from "./_components/location-label";
import { OnboardingGate } from "./_components/onboarding-gate";
import { CardNewsTeaser } from "./_components/card-news-teaser";

// F01 홈 — 위치(GPS)·검색·인기 야채. 야채 선택 전용(촬영 진입 없음 — 촬영은 F03-1 제보 흐름에서만).
// 마이페이지 진입은 GNB로 통합(중복 진입점 제거). RSC 기본; 위치·검색·온보딩 게이트·GNB만 클라 leaf.
export default function HomePage() {
  return (
    <PhoneFrame>
      <OnboardingGate />
      <Scroll className="pb-4">
        <div className="flex flex-col gap-5 px-4 pt-1">
          <LocationLabel />
          <CardNewsTeaser />
          <HomeVegetables />
        </div>
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
