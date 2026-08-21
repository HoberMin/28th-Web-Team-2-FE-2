import "server-only";

import type { PriceDetailReport } from "@/app/(detail)/prices/[itemId]/_price-detail-client";
import type { PricePeriod, PricePoint } from "../../types";
import { PUBLIC_PRICE_PERIODS, type PublicPricePeriod } from "../schemas/item-prices";
import type { RegionItemReport } from "../schemas/region-item-reports";
import { getPublicPriceTrend } from "./items";
import { isTemporaryDataError } from "./items-fallback";
import { getRegionItemReports } from "./reports";

/** 시세 상세의 동네 제보 섹션은 데이터 적재 전 응답에 한해 더미로 폴백한다. */

const PERIOD_TO_SPRING: Record<PricePeriod, PublicPricePeriod> = {
  week: "WEEK",
  month: "MONTH",
  year: "YEAR",
};

/** 화면의 세 기간 탭을 채우려면 기간별로 따로 호출해야 한다(스펙이 period 하나만 받는다). */
export async function getPublicPriceSeries(params: {
  itemId: number;
  regionId: string;
}): Promise<Record<PricePeriod, PricePoint[]>> {
  const periods = Object.keys(PERIOD_TO_SPRING) as PricePeriod[];
  const settled = await Promise.all(
    periods.map(async (period) => {
      const trend = await getPublicPriceTrend({
        itemId: params.itemId,
        regionId: params.regionId,
        period: PERIOD_TO_SPRING[period],
      });
      return [period, trend.points] as const;
    }),
  );

  return Object.fromEntries(settled) as Record<PricePeriod, PricePoint[]>;
}

/** Spring 제보를 화면이 쓰는 모양으로 옮긴다. 기준가가 없으면 등락은 0으로 둔다. */
function toDetailReport(
  report: RegionItemReport,
  basePrice: number | null,
  unit: string,
): PriceDetailReport {
  const diff = basePrice === null ? 0 : report.price - basePrice;
  return {
    id: String(report.reportId),
    reportedAt: Date.parse(`${report.reportedAt}T00:00:00Z`),
    place: report.storeName ?? "동네 제보",
    age: report.reportedAt,
    price: report.price,
    unit: report.unit || unit,
    diff,
    diffPercent: basePrice === null || basePrice === 0 ? 0 : (diff / basePrice) * 100,
  };
}

export async function getRegionItemReportsWithFallback(params: {
  regionId: string;
  itemId: number;
  basePrice: number | null;
  unit: string;
  dummyReports: PriceDetailReport[];
}): Promise<{ reports: PriceDetailReport[]; isTemporary: boolean }> {
  try {
    const page = await getRegionItemReports({
      regionId: params.regionId,
      itemId: params.itemId,
      sort: "LATEST",
      size: 50,
    });
    if (page.reports.length > 0) {
      return {
        reports: page.reports.map((report) =>
          toDetailReport(report, params.basePrice, params.unit),
        ),
        isTemporary: false,
      };
    }
  } catch (error) {
    if (!isTemporaryDataError(error)) throw error;
  }

  if (params.dummyReports.length > 0) {
    console.warn("[region-item-reports] temporary data fallback", {
      regionId: params.regionId,
      itemId: params.itemId,
    });
  }
  return { reports: params.dummyReports, isTemporary: params.dummyReports.length > 0 };
}

export { PUBLIC_PRICE_PERIODS };
