import { PhoneFrame, Scroll } from "./_lib/shell";
import { GNB } from "./_components/gnb";
import { HomeHeader } from "./_components/home-header";
import { OnboardingGate } from "./_components/onboarding-gate";
import { CardNewsTeaser } from "./_components/card-news-teaser";
import { FavoriteStoresCard } from "./_components/favorite-stores-card";
import { FirstReportCard } from "./_components/first-report-card";
import { NearbyCheapStore } from "./_components/nearby-cheap-store";
import { CheapestToday } from "./_components/cheapest-today";
import { getPriceMap, getTodayIso } from "./_lib/home-data";

// 시세는 하루 1회 갱신 → 홈도 1시간 단위 재검증(46종 기준선을 서버에서 한 번에 조립).
export const revalidate = 3600;

// F01 홈 — 여러 정보를 모아 액션을 유도하는 대시보드. 46종 전체 조회는 전용 탭(F01-1, GNB
// "야채시세")이 갖는다.
//
// 순서: 헤더(동네 + 검색) → 첫 제보 안내 → 찜한 가게 → 이 가게 어때요? → 우리 동네 최저가 야채
//       → 이번 주 시세 이야기.
//
// 2026-08-04 정리로 섹션 둘이 사라졌다.
//  - 「이 가격 사도 될까요?」(즉석 판단 F10): 기능째로 삭제. 가격 하나를 넣어 판정을 받는 것보다
//    품목 시세를 보는 쪽이 같은 질문에 더 많이 답했다.
//  - 「8월에 사기 좋은 야채」(제철 추천): 1년 시세 저점이라는 근거가 이 화면의 다른 섹션(이웃이
//    실제로 본 가격)과 결이 달라, 같은 화면에서 둘을 나란히 두면 무엇을 믿을지 흐려졌다.
// 그 자리에 「이 가게 어때요?」가 들어왔다 — 홈에서 답해야 할 질문을 "무엇이 싼가"에서
// "어디로 갈까"까지 한 칸 밀어 준다.
//
// RSC 기본: 시세 계산은 서버. 위치·검색·온보딩 게이트·GNB·개인화 카드만 클라 leaf.
export default async function HomePage() {
  const priceMap = await getPriceMap();
  const todayIso = getTodayIso();

  return (
    <PhoneFrame>
      <OnboardingGate />
      <Scroll className="pb-4">
        <div className="flex flex-col gap-6 px-4 pt-1">
          <HomeHeader />
          <FirstReportCard />
          <FavoriteStoresCard />
          <NearbyCheapStore priceMap={priceMap} todayIso={todayIso} />
          <CheapestToday priceMap={priceMap} todayIso={todayIso} />
          {/* 카드뉴스는 "지금 뭘 해야 하나"가 아니라 둘러보기다 → 이 화면의 원칙대로 아래로 내린다.
              (섹션 자체의 존속은 데이터 출처를 보고 판단하기로 보류 — plan.md 「이번 주 시세 이야기」) */}
          <CardNewsTeaser />
        </div>
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
