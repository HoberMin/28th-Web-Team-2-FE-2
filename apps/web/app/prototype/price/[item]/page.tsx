import Image from "next/image";
import { notFound } from "next/navigation";
import { AppBar, BottomBar, PhoneFrame, Scroll } from "../../_lib/shell";
import { getMartPrice, getVegetable } from "../../_lib/vegetables";
import { getBaselinePrice } from "../../_lib/kamis";
import { formatWon } from "../../_lib/format";
import { PriceChart } from "../../_components/price-chart";
import { DistrictBadge, LatestReportPrice, ReportsList } from "../../_components/report-list";
import { ReportSheet } from "../../_components/report-sheet";
import { FavoriteButton } from "../../_components/favorite-button";

// F03 야채 시세 — 데이터 fetch는 서버(RSC). 그래프·제보·위치만 클라 leaf.
export default async function PricePage({ params }: { params: Promise<{ item: string }> }) {
  const { item } = await params;
  const veg = getVegetable(item);
  if (!veg) notFound();

  const baseline = await getBaselinePrice(veg.id);
  const mart = getMartPrice(veg.id);

  return (
    <PhoneFrame>
      <AppBar
        backHref="/prototype"
        right={<FavoriteButton vegetableId={veg.id} vegetableName={veg.name} size="md" />}
      />
      <Scroll className="pb-4">
        <div className="flex flex-col gap-7 px-4 pb-6">
          {/* 헤더 카드 */}
          <div className="flex gap-4 pt-1">
            <Image
              src={veg.image}
              alt=""
              width={104}
              height={104}
              className="size-26 shrink-0 rounded-2xl object-contain"
            />
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <h1 className="text-head2-20 text-fg-neutral">
                {veg.name} {veg.unit}
              </h1>
              <div className="mt-3 flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-body-16-semibold text-fg-brand">오늘 시세</span>
                  <span className="text-head2-20 text-fg-neutral">{formatWon(baseline.current)}</span>
                </div>
                <hr className="border-bg-neutral-weak" />
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between text-body-14-medium">
                    <span className="text-fg-neutral-subtle">최근 동네 제보가</span>
                    <LatestReportPrice vegetableId={veg.id} />
                  </div>
                  {mart && (
                    <div className="flex items-baseline justify-between text-body-14-medium">
                      <span className="text-fg-neutral-subtle">컬리 온라인가</span>
                      <span className="text-fg-neutral-subtle">{formatWon(mart.price)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 시세 그래프 + 기간 평균가 */}
          <PriceChart vegetableName={veg.name} series={baseline.series} />

          {/* 사용자 제보 실제가 */}
          <section className="flex flex-col gap-4" aria-label="동네 제보가">
            <div className="flex items-center justify-between">
              <h2 className="text-head2-16 text-fg-neutral">동네 제보가</h2>
              <DistrictBadge />
            </div>
            <ReportsList vegetableId={veg.id} />
          </section>
        </div>
      </Scroll>

      <BottomBar>
        <ReportSheet vegetableId={veg.id} />
      </BottomBar>
    </PhoneFrame>
  );
}
