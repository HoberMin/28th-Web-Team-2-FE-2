import { notFound } from "next/navigation";
import IconLocationpinFill from "@karrotmarket/react-monochrome-icon/IconLocationpinFill";
import { AppBar, BottomBar, PhoneFrame, Scroll, StatusBar } from "../../_lib/shell";
import { DEFAULT_DISTRICT, getVegetable } from "../../_lib/vegetables";
import { getBaselinePrice } from "../../_lib/kamis";
import { formatWon } from "../../_lib/format";
import { PriceChart } from "../../_components/price-chart";
import { LatestReportPrice, ReportsList } from "../../_components/report-list";
import { ReportSheet } from "../../_components/report-sheet";

// F03 야채 시세 — 데이터 fetch는 서버(RSC). 그래프·제보 리스트·바텀시트만 클라 leaf.
export default async function PricePage({ params }: { params: Promise<{ item: string }> }) {
  const { item } = await params;
  const veg = getVegetable(item);
  if (!veg) notFound();

  const baseline = await getBaselinePrice(veg.id);

  return (
    <PhoneFrame>
      <StatusBar />
      <AppBar backHref="/prototype" />
      <Scroll className="pb-4">
        <div className="flex flex-col gap-7 px-4 pb-6">
          {/* 헤더 카드 */}
          <div className="flex gap-4 pt-1">
            <span
              className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-bg-neutral-weak text-5xl"
              aria-hidden="true"
            >
              {veg.emoji}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <h1 className="text-head2-20 text-fg-neutral">
                {veg.name} {veg.unit}
              </h1>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-body-14-regular text-fg-neutral-subtle">현재 시세</span>
                  <span className="text-head2-20 text-fg-neutral">{formatWon(baseline.current)}</span>
                </div>
                <hr className="border-bg-neutral-weak" />
                <div className="flex items-baseline justify-between">
                  <span className="text-body-14-regular text-fg-neutral-subtle">
                    최근 제보된 실제가
                  </span>
                  <LatestReportPrice vegetableId={veg.id} district={DEFAULT_DISTRICT} />
                </div>
              </div>
            </div>
          </div>
          <p className="-mt-4 text-caption-12-regular text-fg-neutral-subtle">
            현재 시세는 {baseline.region} 소매 평균 기준이에요.
          </p>

          {/* 시세 그래프 */}
          <PriceChart vegetableName={veg.name} series={baseline.series} />

          {/* 평균가 */}
          <div className="flex items-center justify-between rounded-xl bg-bg-neutral-weak px-4 py-4">
            <span className="text-body-14-medium text-fg-neutral-subtle">평균가</span>
            <span className="text-body-16-semibold text-fg-neutral">{formatWon(baseline.average)}</span>
          </div>

          {/* 사용자 제보 실제가 */}
          <section className="flex flex-col gap-4" aria-label="사용자 제보 실제가">
            <div className="flex items-center justify-between">
              <h2 className="text-head2-16 text-fg-neutral">사용자 제보 실제가</h2>
              <span className="flex items-center gap-0.5 text-body-14-regular text-fg-neutral-subtle">
                <span className="text-fg-brand [&_svg]:size-4" aria-hidden="true">
                  <IconLocationpinFill />
                </span>
                {DEFAULT_DISTRICT}
              </span>
            </div>
            <ReportsList vegetableId={veg.id} district={DEFAULT_DISTRICT} />
          </section>
        </div>
      </Scroll>

      <BottomBar>
        <ReportSheet vegetableId={veg.id} />
      </BottomBar>
    </PhoneFrame>
  );
}
