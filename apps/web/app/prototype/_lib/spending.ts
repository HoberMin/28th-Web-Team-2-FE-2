// 시세 대비 소비금액 계산 — 순수 함수(서버·클라 공용).
// "제보 = 내가 산 가격" 모델이라 내 제보(mine) 1건 = 구매 1건으로 보고,
// 그 1kg 환산가를 같은 품목의 현재 시세(더미 기준선)와 비교한다.

import { getBaselineDummy } from "./vegetables";
import type { Report } from "./types";

export interface SpendingItem {
  report: Report;
  /** 비교 기준 시세(원/kg) — 같은 품목의 현재 시세. */
  baselinePerKg: number;
  /** 시세 대비 절약액(원, 전체 무게 기준). 양수=시세보다 아낌, 음수=더 씀. */
  saved: number;
}

export interface SpendingSummary {
  /** 구매 건수 */
  count: number;
  /** 총 지출(원) */
  spent: number;
  /** 시세 대비 총 절약액(원). 양수=아낌, 음수=초과 지출. */
  saved: number;
}

/** 내 제보 1건을 시세 대비 소비 항목으로 환산. */
export function toSpendingItem(report: Report): SpendingItem {
  const baselinePerKg = getBaselineDummy(report.vegetableId).current;
  const saved = Math.round((baselinePerKg - report.pricePerKg) * report.weightKg);
  return { report, baselinePerKg, saved };
}

/** 내 구매(제보) 목록의 소비 요약. */
export function summarizeSpending(reports: Report[]): SpendingSummary {
  return reports.reduce<SpendingSummary>(
    (acc, r) => {
      const { saved } = toSpendingItem(r);
      return { count: acc.count + 1, spent: acc.spent + r.price, saved: acc.saved + saved };
    },
    { count: 0, spent: 0, saved: 0 },
  );
}
