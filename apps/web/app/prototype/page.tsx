import { PhoneFrame, Scroll } from "./_lib/shell";
import { GNB } from "./_components/gnb";
import { LocationLabel } from "./_components/location-label";
import { OnboardingGate } from "./_components/onboarding-gate";
import { CardNewsTeaser } from "./_components/card-news-teaser";
import { SeasonalPicks } from "./_components/seasonal-picks";
import { QuickJudgeEntry } from "./_components/quick-judge-entry";
import { FavoriteStoresCard } from "./_components/favorite-stores-card";
import { FirstReportCard } from "./_components/first-report-card";
import { CheapestToday } from "./_components/cheapest-today";
import { getHomeData, getPriceMap, getTodayIso } from "./_lib/home-data";

// 시세는 하루 1회 갱신 → 홈도 1시간 단위 재검증(46종 기준선을 서버에서 한 번에 조립).
export const revalidate = 3600;

// F01 홈 — 여러 정보를 모아 액션을 유도하는 대시보드(2026-07-31 개편). 이전엔 46종 전체를
// 검색·필터로 훑는 "야채 시세 조회 화면"이 곧 홈이었는데, 그 역할은 전용 탭(F01-1, GNB
// "야채시세")으로 분리했다. 홈에 남겼던 "야채 시세" 미리보기 섹션도 이후 정리(2026-07-31)로
// 뺐다 — 전용 탭이 있는데 홈에 축약판을 또 두면 같은 걸 두 번 보여주는 셈이라서다.
// 위치 → 즉석 판단 진입 → 첫 제보 안내 → 단골집 → 오늘 최저가(전체보기) → 제철 추천 → 카드뉴스.
// "살 때 된 야채"는 여기서 제거 — 마이페이지 「구매」 화면으로 이동(다른 파도).
// 촬영 진입 없음(촬영은 F03-1 제보 흐름에서만), 마이페이지 진입은 GNB로 통합.
// RSC 기본: 시세·등락·제철 계산은 모두 서버. 위치·온보딩 게이트·GNB·개인화 카드만 클라 leaf.
export default async function HomePage() {
  const { seasonalPicks, month } = await getHomeData();
  const priceMap = await getPriceMap();
  const todayIso = getTodayIso();

  return (
    <PhoneFrame>
      <OnboardingGate />
      <Scroll className="pb-4">
        <div className="flex flex-col gap-6 px-4 pt-1">
          <LocationLabel />
          <QuickJudgeEntry />
          <FirstReportCard />
          <FavoriteStoresCard priceMap={priceMap} todayIso={todayIso} />
          {/* 랭킹(F06)의 최저가 품목 탭에서 옮겨왔다 — 랭킹은 제보왕 단독으로 재편했고,
              이 목록은 아래 제철 추천과 성격이 같아 여기 나란히 둔다. 근거는 서로 다르다:
              이쪽은 오늘 이웃이 실제로 본 가격, 아래는 1년 시세에서 뽑은 계절 저점.
              전체보기는 페이지 이동이 아니라 같은 자리에서 펼친다(cheapest-today.tsx) —
              "오늘 최저가"는 야채시세 탭의 46종 절대가 정렬과 데이터 자체가 다르다(이쪽은
              이웃이 실제로 본 값 + 시세 대비 할인폭이라, 다른 화면으로 보내면 그 맥락을 잃는다). */}
          <CheapestToday priceMap={priceMap} todayIso={todayIso} />
          <SeasonalPicks picks={seasonalPicks} month={month} />
          {/* 카드뉴스는 "지금 뭘 해야 하나"가 아니라 둘러보기다 → 이 화면의 원칙대로 아래로 내린다. */}
          <CardNewsTeaser />
        </div>
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
