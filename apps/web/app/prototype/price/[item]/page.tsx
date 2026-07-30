import Link from "next/link";
import { notFound } from "next/navigation";
import { AppBar, BottomBar, PhoneFrame, Scroll } from "../../_lib/shell";
import { getOnlinePrices, getVegetable } from "../../_lib/vegetables";
import { getBaselinePrice } from "../../_lib/kamis";
import { getTodayIso } from "../../_lib/home-data";
import { formatWon } from "../../_lib/format";
import { getDailyTrend } from "../../_lib/trend";
import { PriceChart } from "../../_components/price-chart";
import { DistrictBadge, LatestReportPrice, ReportsList } from "../../_components/report-list";
import { ReportSheet } from "../../_components/report-sheet";
import { FavoriteButton } from "../../_components/favorite-button";
import { CommentList } from "../../_components/comment-list";
import { RecipeList } from "../../_components/recipe-list";
import { CheapestMonthBadge } from "../../_components/cheapest-month-badge";
import { AddToBasketButton } from "../../_components/add-to-basket-button";
import { VegetableThumb } from "../../_components/vegetable-thumb";
import { OnlinePrices } from "../../_components/online-prices";
import { TrendLabel } from "../../_components/trend-label";
import { CollapsibleSection } from "../../_components/collapsible-section";
import { getRecipesFor } from "../../_lib/recipes";

// F03 야채 시세 — 데이터 fetch는 서버(RSC). 그래프·제보·댓글만 클라 leaf.
// 색·크기는 seed 토큰으로 통일했다(이전엔 Figma hex를 직접 박아 새 섹션과 두 색 체계가 섞였다).
export default async function PricePage({ params }: { params: Promise<{ item: string }> }) {
  const { item } = await params;
  const veg = getVegetable(item);
  if (!veg) notFound();

  const baseline = await getBaselinePrice(veg.id);
  const online = getOnlinePrices(veg.id);
  const trend = getDailyTrend(baseline.series.week);
  const todayIso = getTodayIso();
  const hasRecipes = getRecipesFor(veg.id).length > 0;

  return (
    <PhoneFrame>
      <AppBar
        backHref="/prototype"
        right={<FavoriteButton vegetableId={veg.id} vegetableName={veg.name} size="md" />}
      />
      <Scroll className="pb-4">
        <div className="flex flex-col pb-6">
          {/* 헤더 카드 — 오늘 시세를 가장 크게, 비교값(제보가·온라인)은 아래 작게 */}
          <div className="flex gap-4 px-4 pt-1 pb-6">
            <VegetableThumb image={veg.image} emoji={veg.emoji} size="hero" />
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <h1 className="text-head1-20 text-fg-neutral">
                {veg.name} <span className="text-fg-neutral-subtle">{veg.unit}</span>
              </h1>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-body-16-semibold text-fg-brand">오늘 시세</span>
                  <span className="text-head2-20 tabular-nums text-fg-neutral">
                    {formatWon(baseline.current)}
                  </span>
                </div>
                {/* 전일 대비 — 홈 그리드와 같은 기준(어제 대비)을 상세에서도 그대로 보여준다 */}
                <div className="flex items-center justify-between">
                  <span className="text-caption-12-regular text-fg-neutral-subtle">어제 대비</span>
                  <TrendLabel trend={trend} />
                </div>
                <hr className="border-bg-neutral-weak-pressed" />
                <div className="flex items-end justify-between">
                  <span className="text-body-14-medium text-fg-neutral-subtle">최근 동네 제보가</span>
                  <LatestReportPrice vegetableId={veg.id} />
                </div>
              </div>
            </div>
          </div>

          {/* 액션 — 담기와 즉석 판단을 한 묶음으로. 이전엔 두 줄로 떨어져 각각 다른 무게로 읽혔다 */}
          <div className="flex flex-col gap-2 px-4 pb-4">
            <AddToBasketButton
              vegetableId={veg.id}
              vegetableName={veg.name}
              unitType={veg.unitType}
            />
            {/* 매장에서 바로 판단하고 싶을 때 — 가격만 넣으면 되는 최단 경로로 보낸다 */}
            <Link
              href={`/prototype/judge?item=${veg.id}`}
              className="flex min-h-11 items-center justify-center rounded-xl bg-bg-brand-weak px-4 py-3 text-body-14-medium text-fg-brand active:bg-bg-brand-weak-pressed"
            >
              지금 본 가격이 괜찮은지 확인하기
            </Link>
          </div>

          {/* 섹션 구분 band */}
          <div className="h-1.5 shrink-0 bg-bg-neutral-weak" aria-hidden="true" />

          {/* 동네 제보가 — 그래프보다 위다. 이 서비스의 차별점이자 "지금 살까"의 직접 근거이고,
              공공 시세는 기준선일 뿐 동네에서 실제로 가능한 가격이 아니다 */}
          <section className="flex flex-col gap-4 px-4 pt-6" aria-label="동네 제보가">
            <div className="flex items-center justify-between">
              <h2 className="text-head2-18 text-fg-neutral">동네 제보가</h2>
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

          {/* 시세 그래프 + 기간 평균가 + 온라인가(보조 기준) */}
          <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
            <PriceChart vegetableName={veg.name} series={baseline.series} />
            <CheapestMonthBadge yearSeries={baseline.series.year} source={baseline.source} />
            {online && <OnlinePrices set={online} unit={veg.unit} />}
          </div>

          {/* 섹션 구분 band */}
          <div className="h-1.5 shrink-0 bg-bg-neutral-weak" aria-hidden="true" />

          {/* 아래 둘은 "지금 살까" 판단에 필요하지 않다 → 기본 접힘.
              펼치지 않으면 판단 근거가 스크롤 없이 읽힌다 */}
          {hasRecipes && (
            <CollapsibleSection title="이 야채로 만드는 레시피" note="예시 · 제휴 아님">
              <RecipeList vegetableId={veg.id} />
            </CollapsibleSection>
          )}

          <CollapsibleSection title="동네 댓글">
            <CommentList vegetableId={veg.id} />
          </CollapsibleSection>
        </div>
      </Scroll>

      <BottomBar>
        <ReportSheet vegetableId={veg.id} />
      </BottomBar>
    </PhoneFrame>
  );
}
