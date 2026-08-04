import { notFound } from "next/navigation";
import { BottomBar, PhoneFrame, Scroll } from "../../_lib/shell";
import { getOnlinePrices, getVegetable } from "../../_lib/vegetables";
import { getBaselinePrice } from "../../_lib/kamis";
import { getTodayIso } from "../../_lib/home-data";
import { formatWon } from "../../_lib/format";
import { getDailyTrend } from "../../_lib/trend";
import { PriceChart } from "../../_components/price-chart";
import { DistrictBadge, LatestReportPrice, ReportsList } from "../../_components/report-list";
import { ReportSheet } from "../../_components/report-sheet";
import { PriceAppBar } from "../../_components/price-app-bar";
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
                {/* 비교값 — 라벨은 「오늘 시세」 한 마디다(2026-08-04).
                    예전엔 "오늘 시세 · 26.08.03 기준 · 예시 데이터"까지 한 줄에 붙어 있었는데,
                    기준일과 데이터 출처는 이 자리에서 사용자가 하는 판단("동네가 싼가")에
                    쓰이지 않으면서 줄을 두 줄로 밀어냈다. 그래프 섹션이 같은 정보를 갖고 있다. */}
                <div className="flex items-center justify-between">
                  <span className="text-caption-12-regular text-fg-neutral-muted">오늘 시세</span>
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

          {/* 「이 가격 사도 될지 판단해보기」(F10) 진입점은 2026-08-04에 걷어냈다 — 기능째로
              삭제했다. 가격을 따로 입력해 판정을 받는 것보다, 이 화면의 동네 제보가·오늘 시세를
              나란히 보는 쪽이 같은 질문에 더 직접 답한다. */}

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
