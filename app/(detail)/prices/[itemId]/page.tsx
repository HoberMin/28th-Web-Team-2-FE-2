import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import { formatWon } from "@/app/_lib/format";
import { getBaselinePrice } from "@/app/_lib/kamis";
import { ROUTES } from "@/app/_lib/routes";
import type { OnlineMall } from "@/app/_lib/types";
import {
  DEFAULT_DISTRICT,
  getNeighborhoodSeedReports,
  getOnlinePrices,
  getVegetable,
} from "@/app/_lib/vegetables";
import {
  NeighborhoodPrices,
  PriceSectionNav,
  PublicPriceChart,
  type PriceDetailReport,
} from "./_price-detail-client";
import { PriceDetailBackButton } from "./_back-button";

interface PriceDetailPageProps {
  params: Promise<{ itemId: string }>;
}

export async function generateMetadata({ params }: PriceDetailPageProps): Promise<Metadata> {
  const { itemId } = await params;
  const vegetable = getVegetable(itemId);
  return { title: vegetable ? `${vegetable.name} 시세` : "야채 시세 상세" };
}

export default async function PriceDetailPage({ params }: PriceDetailPageProps) {
  const { itemId } = await params;
  const vegetable = getVegetable(itemId);
  if (!vegetable) notFound();

  const baseline = await getBaselinePrice(vegetable.id);
  const reports = getNeighborhoodSeedReports(DEFAULT_DISTRICT)
    .filter((report) => report.vegetableId === vegetable.id)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const latestReport = reports[0];
  const online = getOnlinePrices(vegetable.id);
  const averageWeightNote = vegetable.id === "cucumber" ? "오이 1개는 평균 200g이에요" : null;
  const detailReports: PriceDetailReport[] = reports.map((report) => ({
    id: report.id,
    reportedAt: Date.parse(report.createdAt),
    place: report.place ?? report.district,
    age: formatAge(report.createdAt, baseline.asOf),
    price: report.pricePerKg,
    unit: vegetable.unit,
    diff: report.pricePerKg - baseline.current,
    diffPercent: ((report.pricePerKg - baseline.current) / baseline.current) * 100,
  }));

  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-surface-secondary">
      <div className="flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden bg-surface-primary">
        <header className="flex h-12.25 shrink-0 items-center justify-between border-b border-border-secondary px-1">
          <PriceDetailBackButton />
          <p className="text-body-16-semibold text-content-primary">
            {vegetable.name} {vegetable.unit}
          </p>
          <span aria-hidden="true" className="size-12 shrink-0" />
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <h1 className="sr-only">{vegetable.name} 야채 시세 상세</h1>
          <PriceSectionNav />

          <NeighborhoodPrices reports={detailReports} />
          <div className="h-2 bg-border-secondary" />
          <PublicPriceChart series={baseline.series} />
          <div className="h-2 bg-border-secondary" />

          <section id="online-prices" className="scroll-mt-12 px-4 py-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-md border border-border-primary p-3">
                <span className="text-body-14-medium text-content-secondary">최근 동네 제보가</span>
                <p className="flex items-center gap-1">
                  <span className="text-body-14-medium text-content-secondary">
                    {latestReport ? formatWon(latestReport.pricePerKg) : "제보 없음"}
                  </span>
                  <span className="text-caption-12-regular text-content-disabled">/{vegetable.unit}</span>
                </p>
              </div>
              {averageWeightNote ? (
                <div className="flex items-center justify-center gap-1 rounded-md bg-surface-brand px-3 py-2 text-content-brand-light">
                  <FigmaIcon name="information-circle" width={16} />
                  <p className="text-body-14-medium">{averageWeightNote}</p>
                </div>
              ) : null}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <ul>
                {online?.prices.map((price) => {
                  const comparison = latestReport ? price.price - latestReport.pricePerKg : null;
                  return (
                    <li key={price.mall} className="border-b border-border-secondary py-4 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex min-w-0 items-center gap-2">
                          <MallLogo mall={price.mall} />
                          <div className="w-[102px] min-w-0 shrink-0">
                            <p className="truncate text-body-16-medium text-content-primary">{price.mall}</p>
                            <p className="truncate text-caption-12-medium text-content-disabled">
                              {price.channel}{price.channelNote ? ` · ${price.channelNote}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="flex items-center justify-end gap-1">
                            <strong className="text-body-16-bold text-content-primary">{formatWon(price.price)}</strong>
                            <span className="text-caption-12-regular text-content-disabled">/{vegetable.unit}</span>
                          </p>
                          <p className={`text-caption-12-medium ${comparison !== null && comparison < 0 ? "text-trend-down" : "text-content-disabled"}`}>
                            {comparison === null
                              ? "동네 제보가와 비교할 수 없어요"
                              : comparison < 0
                                ? "최근 동네 제보가보다 저렴해요!"
                                : comparison === 0
                                  ? "최근 동네 제보가와 같아요"
                                  : "동네 제보가보다 비싸요"}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="text-caption-12-medium text-content-disabled">
                <span className="block">배송 조건이 달라 온라인 최저가만으로는 비교가 어려워요.</span>
                <span className="block">오프라인 동네 가격을 기준으로, 온라인은 참고만 해주세요.</span>
              </p>
            </div>
          </section>
        </main>

        <footer className="shrink-0 border-t border-border-secondary bg-surface-primary px-4 py-3" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          <Link
            href={`${ROUTES.report}?item=${vegetable.id}`}
            className="flex w-full items-center justify-center rounded-lg bg-action-secondary-default px-7 py-3 text-body-16-semibold text-content-inverse active:bg-content-secondary"
          >
            우리 동네 가격 제보하기
          </Link>
        </footer>
      </div>
    </div>
  );
}

const MALL_IMAGE: Record<OnlineMall, string> = {
  컬리: "online-kurly.svg",
  오아시스: "online-oasis.svg",
  "GS SHOP": "online-gs-shop.svg",
  "11번가": "online-11st.svg",
};

function MallLogo({ mall }: { mall: OnlineMall }) {
  return (
    <FigmaImage
      name={MALL_IMAGE[mall]}
      width={48}
      height={48}
      className="size-12 shrink-0 rounded-full"
    />
  );
}

function formatAge(createdAt: string, asOf: string): string {
  const days = Math.max(
    0,
    Math.floor((Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${createdAt.slice(0, 10)}T00:00:00Z`)) / 86_400_000),
  );
  if (days === 0) return "오늘";
  if (days === 1) return "어제";
  return `${days}일 전`;
}
