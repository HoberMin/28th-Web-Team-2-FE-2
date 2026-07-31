import { notFound } from "next/navigation";
import { BottomBar, PhoneFrame, Scroll } from "../../_lib/shell";
import { getOnlinePrices, getVegetable } from "../../_lib/vegetables";
import { getBaselinePrice } from "../../_lib/kamis";
import { getTodayIso } from "../../_lib/home-data";
import { formatDateDot, formatWon } from "../../_lib/format";
import { getDailyTrend } from "../../_lib/trend";
import { PriceChart } from "../../_components/price-chart";
import { DistrictBadge, LatestReportPrice, ReportsList } from "../../_components/report-list";
import { ReportSheet } from "../../_components/report-sheet";
import { PriceAppBar } from "../../_components/price-app-bar";
import { CalloutLink } from "../../_components/callout-link";
import { CheapestMonthBadge } from "../../_components/cheapest-month-badge";
import { VegetableThumb } from "../../_components/vegetable-thumb";
import { OnlinePrices } from "../../_components/online-prices";
import { TrendLabel } from "../../_components/trend-label";

// F03 야채 시세 — 데이터 fetch는 서버(RSC). 그래프·제보만 클라 leaf(댓글은 F09 가게 상세로 이동).
// 색·크기는 seed 토큰으로 통일했다(이전엔 Figma hex를 직접 박아 새 섹션과 두 색 체계가 섞였다).
export default async function PricePage({ params }: { params: Promise<{ item: string }> }) {
  const { item } = await params;
  const veg = getVegetable(item);
  if (!veg) notFound();

  const baseline = await getBaselinePrice(veg.id);
  const online = getOnlinePrices(veg.id);
  const trend = getDailyTrend(baseline.series.week);
  const todayIso = getTodayIso();

  return (
    <PhoneFrame>
      {/* 뒤로가기 — 랭킹·가게·가게 상세 등 여러 경로에서 들어와 고정 목적지(`/prototype`)로
          튕기면 안 된다. 온 길로 돌아가고, 히스토리가 없으면 홈으로 폴백(클라 leaf). */}
      <PriceAppBar vegetableId={veg.id} vegetableName={veg.name} />
      <Scroll className="pb-4">
        <div className="flex flex-col pb-6">
          {/* 헤더 카드 — 동네 제보가가 주인공(가장 크게), 오늘 시세(공공)는 그 아래 비교값.
              공공 시세는 기준선일 뿐 동네에서 실제로 가능한 가격이 아니라서 뒤집었다. */}
          <div className="flex gap-4 px-4 pt-1 pb-6">
            <VegetableThumb image={veg.image} emoji={veg.emoji} size="hero" />
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <h1 className="text-head1-20 text-fg-neutral">
                {veg.name} <span className="text-fg-neutral-muted">{veg.unit}</span>
              </h1>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-end justify-between gap-2">
                  <span className="text-body-16-semibold text-fg-neutral">동네 제보가</span>
                  <LatestReportPrice vegetableId={veg.id} />
                </div>
                <hr className="border-bg-neutral-weak-pressed" />
                {/* 비교값 — 기준일 + 폴백 여부를 함께 밝힌다(공통 백로그: 진짜/더미 구분 불가 문제). */}
                <div className="flex items-center justify-between">
                  <span className="text-caption-12-regular text-fg-neutral-muted">
                    오늘 시세 · {formatDateDot(baseline.asOf)} 기준
                    {baseline.isFallback ? " · 예시 데이터" : ""}
                  </span>
                  <span className="text-body-14-medium tabular-nums text-fg-neutral-muted">
                    {formatWon(baseline.current)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-caption-12-regular text-fg-neutral-muted">어제 대비</span>
                  <TrendLabel trend={trend} />
                </div>
              </div>
            </div>
          </div>

          {/* 판단 진입 — 가게 가격표 앞에서 "이 가격 사도 되나"만 3초에 확인하고 싶을 때.
              하단 제보 시트는 이제 제보 전용이라(F10 백로그 #11), 판단은 여기 위쪽 CTA로
              들어간다: 위=판단, 아래=제보로 역할이 문구로 갈린다. */}
          <div className="px-4 pb-2">
            <CalloutLink href={`/prototype/judge?item=${veg.id}`}>
              이 가격 사도 될지 판단해보기
            </CalloutLink>
          </div>

          {/* 섹션 구분 band */}
          <div className="h-1.5 shrink-0 bg-bg-neutral-weak" aria-hidden="true" />

          {/* 동네 제보가 — 그래프보다 위이고 제목도 한 급 위다. 이 서비스의 차별점이자
              "지금 살까"의 직접 근거다. */}
          <section className="flex flex-col gap-4 px-4 pt-6" aria-label="동네 제보가">
            <div className="flex items-center justify-between">
              <h2 className="text-head2-20 text-fg-neutral">동네 제보가</h2>
              <DistrictBadge />
            </div>
            <ReportsList
              vegetableId={veg.id}
              basePrice={baseline.current}
              todayIso={todayIso}
              unit={veg.unit}
            />
          </section>

          {/* 섹션 구분 band */}
          <div className="mt-6 h-1.5 shrink-0 bg-bg-neutral-weak" aria-hidden="true" />

          {/* 시세 그래프 + 기간 평균가 + 온라인가(보조 기준, 동네 제보가와 같은 축으로 비교) */}
          <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
            <PriceChart vegetableName={veg.name} series={baseline.series} />
            <CheapestMonthBadge yearSeries={baseline.series.year} />
            {online && (
              <OnlinePrices
                set={online}
                unit={veg.unit}
                vegetableId={veg.id}
                vegetableName={veg.name}
                baselinePrice={baseline.current}
              />
            )}
          </div>
        </div>
      </Scroll>

      <BottomBar>
        <ReportSheet vegetableId={veg.id} />
      </BottomBar>
    </PhoneFrame>
  );
}
