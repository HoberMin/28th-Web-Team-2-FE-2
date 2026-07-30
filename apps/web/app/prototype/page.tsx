import { PhoneFrame, Scroll } from "./_lib/shell";
import { GNB } from "./_components/gnb";
import { HomeVegetables } from "./_components/home-vegetables";
import { LocationLabel } from "./_components/location-label";
import { OnboardingGate } from "./_components/onboarding-gate";
import { CardNewsTeaser } from "./_components/card-news-teaser";
import { SeasonalPicks } from "./_components/seasonal-picks";
import { QuickJudgeEntry } from "./_components/quick-judge-entry";
import { FavoriteStoresCard } from "./_components/favorite-stores-card";
import { FirstReportCard } from "./_components/first-report-card";
import { getHomeData, getPriceMap, getPriceMeta, getTodayIso } from "./_lib/home-data";

// 시세는 하루 1회 갱신 → 홈도 1시간 단위 재검증(46종 기준선을 서버에서 한 번에 조립).
export const revalidate = 3600;

// F01 홈 — 위치 → 즉석 판단 진입 → 검색+그리드(46종) → 첫 제보 안내 → 단골집 → 제철 추천 → 카드뉴스.
// 위계 변경(백로그 F01): 검색+그리드를 개인화 카드(첫 제보·단골집)보다 위로 뒀다. 조건부 카드가
// 항상 뜨는 게 아니라서, 위에 있으면 신규 유저 화면이 휑하고 헤비 유저는 주 콘텐츠(그리드)가
// 첫 화면 밖으로 밀린다. "살 때 된 야채"는 여기서 제거 — 마이페이지 「구매」 화면으로 이동(다른 파도).
// 촬영 진입 없음(촬영은 F03-1 제보 흐름에서만), 마이페이지 진입은 GNB로 통합.
// RSC 기본: 시세·등락·제철 계산은 모두 서버. 위치·검색·온보딩 게이트·GNB·개인화 카드만 클라 leaf.
export default async function HomePage() {
  const { items, seasonalPicks, month } = await getHomeData();
  const priceMap = await getPriceMap();
  const priceMeta = await getPriceMeta();
  const todayIso = getTodayIso();

  return (
    <PhoneFrame>
      <OnboardingGate />
      <Scroll className="pb-4">
        <div className="flex flex-col gap-6 px-4 pt-1">
          <LocationLabel />
          <QuickJudgeEntry />
          <HomeVegetables items={items} priceMeta={priceMeta} />
          <FirstReportCard />
          <FavoriteStoresCard priceMap={priceMap} todayIso={todayIso} />
          <SeasonalPicks picks={seasonalPicks} month={month} />
          {/* 카드뉴스는 "지금 뭘 해야 하나"가 아니라 둘러보기다 → 이 화면의 원칙대로 아래로 내린다. */}
          <CardNewsTeaser />
        </div>
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
