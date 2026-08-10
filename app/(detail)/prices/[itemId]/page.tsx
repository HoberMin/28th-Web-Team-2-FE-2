import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import { formatWon } from "@/app/_lib/format";
import { getBaselinePrice } from "@/app/_lib/kamis";
import { ROUTES } from "@/app/_lib/routes";
import { getDailyTrend } from "@/app/_lib/trend";
import type { OnlineMall } from "@/app/_lib/types";
import {
  DEFAULT_DISTRICT,
  getNeighborhoodSeedReports,
  getOnlinePrices,
  getVegetable,
} from "@/app/_lib/vegetables";
import { PRICE_VEGETABLE_IMAGE_BY_ID } from "@/app/(tabs)/prices/_images";
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
  const trend = getDailyTrend(baseline.series.week);
  const reports = getNeighborhoodSeedReports(DEFAULT_DISTRICT)
    .filter((report) => report.vegetableId === vegetable.id)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const latestReport = reports[0];
  const online = getOnlinePrices(vegetable.id);
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
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-4">
          <h1 className="sr-only">{vegetable.name} 야채 시세 상세</h1>

          <section className="flex gap-4 px-4 pt-7 pb-8 min-[390px]:gap-5">
            <div className="relative size-28 shrink-0 overflow-hidden rounded-xl border border-border-img bg-background-secondary min-[390px]:size-31">
              <Image
                src={PRICE_VEGETABLE_IMAGE_BY_ID[vegetable.id]}
                alt={`${vegetable.name} 대표 이미지`}
                fill
                sizes="124px"
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-content-primary">
                <strong className="text-title-20-bold">{vegetable.name}</strong>
                <span className="text-title-18-medium">{vegetable.unit}</span>
              </div>
              <div className="mt-0.5 flex items-center justify-between border-b border-border-secondary py-2">
                <span className="text-body-14-medium text-content-secondary min-[390px]:text-body-16-medium">최근 동네 제보가</span>
                <strong className="text-body-16-semibold text-content-primary min-[390px]:text-title-18-semibold">
                  {latestReport ? formatWon(latestReport.pricePerKg) : "제보 없음"}
                </strong>
              </div>
              <div className="mt-2 flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-caption-12-medium text-content-disabled">오늘 공공 시세</span>
                  <span className="text-body-14-medium text-content-secondary">{formatWon(baseline.current)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-caption-12-medium text-content-disabled">어제 대비</span>
                  <HeaderTrend trend={trend} />
                </div>
              </div>
            </div>
          </section>

          <div className="h-2 bg-border-secondary" />
          <PriceSectionNav />

          <NeighborhoodPrices reports={detailReports} />
          <div className="h-2 bg-border-secondary" />
          <PublicPriceChart series={baseline.series} />
          <div className="h-2 bg-border-secondary" />

          <section id="online-prices" className="scroll-mt-12 px-4 py-8">
            <div className="flex items-center justify-between rounded-md bg-surface-secondary px-3 py-2">
              <span className="text-body-14-medium text-content-secondary">최근 동네 제보가</span>
              <p className="flex items-center gap-1">
                <span className="text-body-14-medium text-content-secondary">
                  {latestReport ? formatWon(latestReport.pricePerKg) : "제보 없음"}
                </span>
                <span className="text-caption-12-regular text-content-disabled">/{vegetable.unit}</span>
              </p>
            </div>
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
                        <p className={`text-caption-12-medium ${comparison !== null && comparison < 0 ? "text-content-brand-light" : "text-content-disabled"}`}>
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

function HeaderTrend({ trend }: { trend: ReturnType<typeof getDailyTrend> }) {
  if (!trend || trend.direction === "flat") {
    return <span className="text-caption-12-medium text-trend-flat">변동 없음</span>;
  }
  const sign = trend.direction === "up" ? "+" : "-";
  return (
    <span className={`flex items-center text-caption-12-medium ${trend.direction === "down" ? "text-trend-down" : "text-trend-up"}`}>
      <FigmaIcon name={`trend-${trend.direction}`} width={16} />
      {formatWon(trend.diff)}({sign}{trend.pct}%)
    </span>
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
