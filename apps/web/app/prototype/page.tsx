import Image from "next/image";
import Link from "next/link";
import { PhoneFrame, Scroll } from "./_lib/shell";
import { HomeVegetables } from "./_components/home-vegetables";
import { LocationLabel } from "./_components/location-label";
import { OnboardingGate } from "./_components/onboarding-gate";

// F01 홈 — 위치(GPS)·검색·인기 야채. 야채 선택 전용(촬영 진입 없음 — 촬영은 F03-1 제보 흐름에서만).
// RSC 기본; 위치·검색·온보딩 게이트만 클라 leaf.
export default function HomePage() {
  return (
    <PhoneFrame>
      <OnboardingGate />
      <Scroll className="pb-6">
        <div className="flex flex-col gap-5 px-4 pt-1">
          <div className="flex items-center justify-between">
            <LocationLabel />
            <Link
              href="/prototype/mypage"
              aria-label="마이페이지"
              className="flex size-11 items-center justify-center rounded-full hover:bg-bg-neutral-weak"
            >
              <Image src="/veg/User.svg" alt="" width={28} height={28} className="size-7" />
            </Link>
          </div>
          <HomeVegetables />
        </div>
      </Scroll>
    </PhoneFrame>
  );
}
