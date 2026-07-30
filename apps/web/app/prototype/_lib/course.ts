// 장보기 코스 계산 — "한 곳에서 다 살까, 두 곳을 돌까"를 금액으로 보여준다.
//
// 왜 필요한가: 품목별 최저가를 알려주면 감자는 A가게, 오이는 B가게로 흩어진다. 다 따라가면
// 발걸음이 늘어 핵심 가치인 "노력 절약"과 반대가 된다. 그래서 절약액과 **들르는 가게 수**를
// 같이 보여주고 선택은 사용자에게 맡긴다. ("1,600원 아끼려고 한 곳 더 갈래요?")
//
// 순수 함수(서버·클라 공용).

import type { BasketItem } from "./basket-store";
import type { Report } from "./types";
import { isOutlier, type PriceMap } from "./stores";

export interface CourseOption {
  /** 들르는 가게 (1~2곳) */
  stores: string[];
  /** 예상 총액(원) */
  total: number;
  /** 제보가로 값을 채운 품목 수 */
  coveredCount: number;
  /** 제보가 없어 공공 시세로 대체한 품목 수 */
  fallbackCount: number;
}

export interface CoursePlan {
  /** 공공 시세만으로 계산한 총액 — 비교 기준선 */
  baselineTotal: number;
  /** 한 곳에서 다 사는 최선안 */
  single: CourseOption | null;
  /** 두 곳을 도는 최선안. 한 곳 안보다 싸지 않으면 null */
  pair: CourseOption | null;
  /** 두 곳을 돌아 더 아끼는 금액(원). pair가 없으면 0 */
  extraSaving: number;
}

/** 가게별 품목 최신 제보 단가 맵 — { place: { vegetableId: pricePerUnit } } */
function buildStorePriceIndex(
  reports: Report[],
  priceMap: PriceMap,
): Map<string, Map<string, number>> {
  const index = new Map<string, Map<string, number>>();
  const latest = new Map<string, Report>();

  for (const r of reports) {
    if (!r.place) continue;
    if (isOutlier(r.pricePerKg, priceMap[r.vegetableId] ?? null)) continue;
    const key = `${r.place}|${r.vegetableId}`;
    const prev = latest.get(key);
    if (!prev || Date.parse(r.createdAt) > Date.parse(prev.createdAt)) latest.set(key, r);
  }

  for (const r of latest.values()) {
    if (!r.place) continue;
    const store = index.get(r.place) ?? new Map<string, number>();
    store.set(r.vegetableId, r.pricePerKg);
    index.set(r.place, store);
  }
  return index;
}

/** 한 조합(1~2곳)으로 장바구니를 채웠을 때의 총액. 없는 품목은 공공 시세로 대체한다. */
function priceBasket(
  items: BasketItem[],
  stores: string[],
  index: Map<string, Map<string, number>>,
  priceMap: PriceMap,
): CourseOption | null {
  let total = 0;
  let coveredCount = 0;
  let fallbackCount = 0;

  for (const item of items) {
    const candidates: number[] = [];
    for (const store of stores) {
      const price = index.get(store)?.get(item.vegetableId);
      if (price !== undefined) candidates.push(price);
    }
    if (candidates.length > 0) {
      total += Math.min(...candidates) * item.weightKg;
      coveredCount += 1;
    } else {
      const baseline = priceMap[item.vegetableId];
      // 시세도 없는 품목(비수기)은 총액에서 뺀다 — 없는 값을 0원처럼 보이게 하면 안 된다.
      if (baseline == null) continue;
      total += baseline * item.weightKg;
      fallbackCount += 1;
    }
  }

  if (coveredCount === 0) return null;
  return { stores, total: Math.round(total), coveredCount, fallbackCount };
}

/**
 * 장보기 코스를 계산한다.
 * 한 곳 최선안과 두 곳 최선안을 각각 구하고, 두 곳이 실제로 더 싼 경우에만 pair를 준다.
 */
export function planCourse(
  items: BasketItem[],
  reports: Report[],
  priceMap: PriceMap,
): CoursePlan {
  const baselineTotal = Math.round(
    items.reduce((sum, item) => {
      const baseline = priceMap[item.vegetableId];
      return baseline == null ? sum : sum + baseline * item.weightKg;
    }, 0),
  );

  if (items.length === 0) {
    return { baselineTotal, single: null, pair: null, extraSaving: 0 };
  }

  const index = buildStorePriceIndex(reports, priceMap);
  const storeNames = Array.from(index.keys());

  let single: CourseOption | null = null;
  for (const name of storeNames) {
    const option = priceBasket(items, [name], index, priceMap);
    if (!option) continue;
    // 커버 품목이 많은 쪽 우선 → 같으면 총액이 싼 쪽
    if (
      !single ||
      option.coveredCount > single.coveredCount ||
      (option.coveredCount === single.coveredCount && option.total < single.total)
    ) {
      single = option;
    }
  }

  let pair: CourseOption | null = null;
  for (let i = 0; i < storeNames.length; i++) {
    for (let j = i + 1; j < storeNames.length; j++) {
      const option = priceBasket(items, [storeNames[i], storeNames[j]], index, priceMap);
      if (!option) continue;
      if (!pair || option.total < pair.total) pair = option;
    }
  }

  // 두 곳을 도는 게 한 곳보다 싸지 않으면 제안하지 않는다(괜히 발걸음만 늘린다).
  const extraSaving = single && pair ? single.total - pair.total : 0;
  if (extraSaving <= 0) pair = null;

  return { baselineTotal, single, pair, extraSaving: Math.max(0, extraSaving) };
}
