import "server-only";

import type { PriceDetailReport } from "@/app/(detail)/prices/[itemId]/_price-detail-client";
import type { PricePeriod, PricePoint } from "../../types";
import { PUBLIC_PRICE_PERIODS, type PublicPricePeriod } from "../schemas/item-prices";
import type { RegionItemReport } from "../schemas/region-item-reports";
import { getPublicPriceTrend } from "./items";
import { isTemporaryDataError } from "./items-fallback";
import { getRegionItemReports } from "./reports";

/**
 * 시세 상세의 그래프·동네 제보 섹션을 라이브로 채우되, **DB가 아직 비어 있으면 더미를 유지**한다.
 *
 * `items-fallback`과 같은 방침이다 — 상류가 정상 200으로 빈 배열을 주는 상태(적재 전)를
 * 에러와 구분해 다루고, 둘 다 더미로 떨어뜨린다. 더미는 지우지 않는다: 지금 화면을 비우면
 * 데모에서 기능이 없는 것처럼 보인다.
 *
 * TODO(✍️): BE 적재가 끝나면 이 파일의 폴백 분기를 걷어내고 직접 호출로 바꾼다.
 */

const PERIOD_TO_SPRING: Record<PricePeriod, PublicPricePeriod> = {
  week: "WEEK",
  month: "MONTH",
  year: "YEAR",
};

/** 화면의 세 기간 탭을 채우려면 기간별로 따로 호출해야 한다(스펙이 period 하나만 받는다). */
export async function getPublicPriceSeriesWithFallback(params: {
  itemId: number;
  regionId: string;
  dummySeries: Record<PricePeriod, PricePoint[]> | null;
}): Promise<{ series: Record<PricePeriod, PricePoint[]> | null; isTemporary: boolean }> {
  const periods = Object.keys(PERIOD_TO_SPRING) as PricePeriod[];
  const settled = await Promise.all(
    periods.map(async (period) => {
      try {
        const trend = await getPublicPriceTrend({
          itemId: params.itemId,
          regionId: params.regionId,
          period: PERIOD_TO_SPRING[period],
        });
        return [period, trend.points] as const;
      } catch (error) {
        if (!isTemporaryDataError(error)) throw error;
        return [period, []] as const;
      }
    }),
  );

  const live = Object.fromEntries(settled) as Record<PricePeriod, PricePoint[]>;
  // 한 기간이라도 비어 있으면 탭을 오가다 빈 그래프를 보게 된다 — 통째로 더미를 쓴다.
  const hasEveryPeriod = periods.every((period) => live[period].length > 0);
  if (hasEveryPeriod) return { series: live, isTemporary: false };

  if (params.dummySeries) {
    console.warn("[public-prices] temporary data fallback (empty upstream points)", {
      itemId: params.itemId,
    });
  }
  return { series: params.dummySeries, isTemporary: params.dummySeries !== null };
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
