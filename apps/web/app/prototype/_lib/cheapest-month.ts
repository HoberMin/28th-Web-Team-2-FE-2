// 월별 최저가 시기 — 식물학적 제철이 아니라, KAMIS 실시세 12개월 평균 시리즈에서 계산한 값이다.
// (baseline.series.year = 최근 1년 월평균, kamis.ts buildYearSeries 산출물)

import type { PricePoint } from "./types";

export interface CheapestMonth {
  /** 1~12 */
  month: number;
  price: number;
  /** 최근(가장 최신 달) 대비 몇 % 더 싼 시기였는지. 양수 = 더 쌌음. */
  cheaperThanLatestPct: number;
}

/** 연 시리즈(월평균, 오래된→최신)에서 가장 쌌던 달을 계산한다. 2개월 미만이면 의미가 없어 null. */
export function getCheapestMonth(yearSeries: PricePoint[]): CheapestMonth | null {
  if (yearSeries.length < 2) return null;

  let cheapest = yearSeries[0];
  for (const p of yearSeries) {
    if (p.price < cheapest.price) cheapest = p;
  }

  const latest = yearSeries[yearSeries.length - 1];
  const cheaperThanLatestPct = latest.price > 0 ? ((latest.price - cheapest.price) / latest.price) * 100 : 0;

  return {
    month: Number(cheapest.date.slice(5, 7)),
    price: cheapest.price,
    cheaperThanLatestPct: Math.round(cheaperThanLatestPct * 10) / 10,
  };
}
