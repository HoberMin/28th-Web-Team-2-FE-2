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
import { CommentList } from "../../_components/comment-list";
import { RecipeList } from "../../_components/recipe-list";
import { CheapestMonthBadge } from "../../_components/cheapest-month-badge";

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
        <div className="flex flex-col pb-6">
          {/* 헤더 카드 */}
          <div className="flex gap-4 px-4 pt-1 pb-7">
            <Image
              src={veg.image}
              alt=""
              width={104}
              height={104}
              className="size-26 shrink-0 rounded-[14.328px] object-contain"
            />
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <h1 className="text-[22px] font-bold leading-normal tracking-[-0.02em] text-[#141a24]">
                {veg.name} {veg.unit}
              </h1>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#ff6f00]">
                    오늘 시세
                  </span>
                  <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#141a24]">
                    {formatWon(baseline.current)}
                  </span>
                </div>
                <hr className="border-[#e5e8ef]" />
                <div className="flex flex-col gap-1">
                  <div className="flex items-end justify-between">
                    <span className="text-[14px] font-medium tracking-[-0.02em] text-[#99a1b1]">
                      최근 동네 제보가
                    </span>
                    <LatestReportPrice vegetableId={veg.id} />
                  </div>
                  {mart && (
                    <div className="flex items-end justify-between">
                      <span className="text-[14px] font-medium tracking-[-0.02em] text-[#99a1b1]">
                        컬리 온라인가
                      </span>
                      <span className="text-[14px] font-medium tracking-[-0.02em] text-[#697383]">
                        {formatWon(mart.price)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 섹션 구분 band */}
          <div className="h-1.5 shrink-0 bg-[#f2f3f8]" aria-hidden="true" />

          {/* 시세 그래프 + 기간 평균가 */}
          <div className="flex flex-col gap-4 px-4 pt-7 pb-7">
            <PriceChart vegetableName={veg.name} series={baseline.series} />
            <CheapestMonthBadge yearSeries={baseline.series.year} source={baseline.source} />
          </div>

          {/* 섹션 구분 band */}
          <div className="h-1.5 shrink-0 bg-[#f2f3f8]" aria-hidden="true" />

          {/* 동네 제보가 */}
          <section className="flex flex-col gap-4 px-4 pt-7" aria-label="동네 제보가">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#141a24]">동네 제보가</h2>
              <DistrictBadge />
            </div>
            <ReportsList vegetableId={veg.id} basePrice={baseline.current} />
          </section>

          {/* 섹션 구분 band */}
          <div className="h-1.5 shrink-0 bg-[#f2f3f8]" aria-hidden="true" />

          {/* 레시피 연계 (예시/더미) */}
          <RecipeList vegetableId={veg.id} />

          {/* 섹션 구분 band */}
          <div className="h-1.5 shrink-0 bg-[#f2f3f8]" aria-hidden="true" />

          {/* 동네 댓글 */}
          <CommentList vegetableId={veg.id} />
        </div>
      </Scroll>

      <BottomBar>
        <ReportSheet vegetableId={veg.id} />
      </BottomBar>
    </PhoneFrame>
  );
}
