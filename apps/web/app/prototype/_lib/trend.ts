// 시세 추이 해석 유틸 — "어제보다 올랐나", "이번 달이 싼 달인가"를 계산한다.
// 순수 함수(서버·클라 공용). 데이터는 BaselinePrice.series를 그대로 쓴다.

import type { BaselinePrice, PricePoint, PriceTrend, Vegetable } from "./types";
import { isInSeason } from "./vegetables";

/**
 * 전일 대비 등락 — 주간 시리즈의 마지막 두 점을 비교한다.
 * 홈 그리드에서 "이모지만 있고 정보가 없다"를 해결하는 최소 정보값.
 * 점이 2개 미만이면 null(표시 생략).
 */
export function getDailyTrend(series: PricePoint[]): PriceTrend | null {
  if (series.length < 2) return null;
  const today = series[series.length - 1].price;
  const yesterday = series[series.length - 2].price;
  if (yesterday <= 0) return null;

  const rawDiff = today - yesterday;
  const diff = Math.abs(rawDiff);
  const pct = Math.round((diff / yesterday) * 1000) / 10;
  // 0.5% 미만 흔들림은 "변화 없음"으로 본다 — 매일 ±10원씩 화살표가 뒤집히면 신호가 아니라 노이즈다.
  if (pct < 0.5) return { direction: "flat", diff: 0, pct: 0 };
  return { direction: rawDiff > 0 ? "up" : "down", diff, pct };
}

/** 월평균 시리즈에서 지금 달이 1년 중 몇 번째로 싼 달인지(1 = 가장 쌈). */
export function getMonthRank(yearSeries: PricePoint[], month: number): number | null {
  if (yearSeries.length < 6) return null;
  const target = yearSeries.find((p) => Number(p.date.slice(5, 7)) === month);
  if (!target) return null;
  const cheaper = yearSeries.filter((p) => p.price < target.price).length;
  return cheaper + 1;
}

export interface SeasonalPick {
  vegetableId: string;
  name: string;
  emoji: string;
  image?: string;
  /** 이번 달 시세 */
  price: number;
  unit: string;
  /** 연 최고가 대비 얼마나 싼지(%) — 클수록 지금이 기회 */
  discountPct: number;
  /** 1년 중 싼 순위(1 = 가장 쌈) */
  rank: number;
}

/**
 * "이번 달 사기 좋은 야채" — 연 월평균 시리즈에서 지금 달이 저점권(상위 3위 이내)인 품목만 고른다.
 * 식물학적 제철이 아니라 **실제 시세 계산값**이다(월별 최저가 시기 기능과 같은 근거).
 * 비수기라 데이터가 없는 품목(수박·딸기 등)은 애초에 제외된다.
 */
export function pickSeasonalBargains(
  entries: Array<{ veg: Vegetable; baseline: BaselinePrice }>,
  month: number,
  limit = 6,
): SeasonalPick[] {
  const picks: SeasonalPick[] = [];

  for (const { veg, baseline } of entries) {
    if (!isInSeason(veg, month)) continue;
    const year = baseline.series.year;
    const rank = getMonthRank(year, month);
    if (rank === null || rank > 3) continue;

    const peak = Math.max(...year.map((p) => p.price));
    const now = baseline.current;
    if (peak <= 0 || now <= 0) continue;
    const discountPct = Math.round(((peak - now) / peak) * 100);
    // 연 최고가와 5% 이내면 "싸다"고 말할 근거가 약하다.
    if (discountPct < 5) continue;

    picks.push({
      vegetableId: veg.id,
      name: veg.name,
      emoji: veg.emoji,
      image: veg.image,
      price: now,
      unit: veg.unit,
      discountPct,
      rank,
    });
  }

  // 할인폭이 큰 순 → 같으면 순위가 앞선 순
  return picks.sort((a, b) => b.discountPct - a.discountPct || a.rank - b.rank).slice(0, limit);
}
