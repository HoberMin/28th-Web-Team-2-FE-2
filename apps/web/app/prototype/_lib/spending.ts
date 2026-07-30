// 시세 대비 소비금액 계산 — 순수 함수(서버·클라 공용).
// 실제로 산 제보(purchased=true) 1건 = 구매 1건으로 보고, 그 1kg 환산가를
// 같은 품목의 오늘 시세와 비교한다. 필터링은 호출부 책임(구매만 넘긴다).
//
// 비교 기준은 항상 **호출부가 넘기는 priceMap**(서버 KAMIS 값, `home-data.ts`의 getPriceMap())을
// 쓴다 — 예전엔 이 파일이 getBaselineDummy()를 직접 불러 마이페이지 절약 계산이 홈·시세 화면과
// 다른 "오늘 시세"를 기준으로 삼는 버그가 있었다(F05 버그 항목).

import type { PriceMap } from "./stores";
import type { Report } from "./types";

export interface SpendingItem {
  report: Report;
  /** 비교 기준 시세(원/kg) — 같은 품목의 오늘 시세. 비수기 등으로 값이 없으면 null. */
  baselinePerKg: number | null;
  /** 시세 대비 절약액(원, 전체 무게 기준). 기준 시세가 없으면 0(계산 불가는 절약 0으로 취급). */
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

/** 내 제보 1건을 시세 대비 소비 항목으로 환산. priceMap은 서버에서 내려온 오늘 시세 기준. */
export function toSpendingItem(report: Report, priceMap: PriceMap): SpendingItem {
  const baselinePerKg = priceMap[report.vegetableId] ?? null;
  const saved = baselinePerKg === null ? 0 : Math.round((baselinePerKg - report.pricePerKg) * report.weightKg);
  return { report, baselinePerKg, saved };
}

/** 내 구매(제보) 목록의 소비 요약. */
export function summarizeSpending(reports: Report[], priceMap: PriceMap): SpendingSummary {
  return reports.reduce<SpendingSummary>(
    (acc, r) => {
      const { saved } = toSpendingItem(r, priceMap);
      return { count: acc.count + 1, spent: acc.spent + r.price, saved: acc.saved + saved };
    },
    { count: 0, spent: 0, saved: 0 },
  );
}
