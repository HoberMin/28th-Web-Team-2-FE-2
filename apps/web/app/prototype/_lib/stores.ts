// 가게 축 집계 — 제보를 "가게(place)" 단위로 다시 묶는다.
//
// 왜 필요한가: 지금까지 모든 화면이 품목 축(감자 화면, 오이 화면…)이었다. 그런데 사용자의
// 실제 질문은 "감자가 얼마야?"가 아니라 **"오늘 어느 가게 갈까?"**다. 감자는 A가게, 오이는
// B가게가 싸다고 흩어 알려주면 발걸음이 늘어 "노력 절약"이 오히려 마이너스가 된다.
// 기획안 문제 정의(A가게 2,490 / B가게 3,000 / 대형마트 4,990)가 곧 가게 비교 문제다.
//
// 순수 함수 모음(서버·클라 공용). 제보 목록과 시세 맵을 받아 계산만 한다.

import type { Report } from "./types";
import { getVegetable } from "./vegetables";

/** 제보가 얼마나 최신인지 — 야채 가격은 주 단위로 움직여 낡은 제보는 오히려 해롭다. */
export type Freshness = "today" | "recent" | "stale";

export interface FreshnessInfo {
  level: Freshness;
  /** 며칠 전 */
  days: number;
  /** 화면에 그대로 쓰는 문구. 예: "오늘", "3일 전" */
  label: string;
}

/** 기준일(오늘) 대비 제보 신선도. 기준일을 인자로 받아 서버·클라 결과가 갈리지 않게 한다. */
export function getFreshness(createdAt: string, todayIso: string): FreshnessInfo {
  const created = Date.parse(createdAt.slice(0, 10));
  const today = Date.parse(todayIso);
  const days = Math.max(0, Math.round((today - created) / 86_400_000));
  if (days === 0) return { level: "today", days, label: "오늘" };
  if (days === 1) return { level: "recent", days, label: "어제" };
  if (days <= 7) return { level: "recent", days, label: `${days}일 전` };
  return { level: "stale", days, label: `${days}일 전` };
}

/**
 * 이상치 판정 — 시세의 3배가 넘거나 1/3보다 싼 제보는 오타·장난일 확률이 높다.
 * 지우지 않고 "확인 필요"로 표시하고 집계에서만 빼는 게 규칙(허위 제보 제재 기준은 미정).
 */
export function isOutlier(pricePerUnit: number, baselinePrice: number | null): boolean {
  if (!baselinePrice || baselinePrice <= 0 || pricePerUnit <= 0) return false;
  return pricePerUnit > baselinePrice * 3 || pricePerUnit < baselinePrice / 3;
}

/**
 * 교차 검증 — 같은 가게·같은 품목에 제보가 2건 이상이면 "이웃 N명이 확인"으로 신뢰를 표시한다.
 * 제보 1건은 근거가 얇고, 2건 이상이면 서로가 증인이 된다.
 */
export function countCrossChecks(reports: Report[], place: string, vegetableId: string): number {
  return reports.filter((r) => r.place === place && r.vegetableId === vegetableId).length;
}

export interface StoreItemPrice {
  vegetableId: string;
  name: string;
  emoji: string;
  image?: string;
  unit: string;
  /** 이 가게의 최신 제보가(기준 단위 환산) */
  price: number;
  /** 오늘 공공 시세. 없으면 null */
  baselinePrice: number | null;
  /** 시세 대비 차이(%). 음수 = 시세보다 쌈 */
  diffPct: number | null;
  freshness: FreshnessInfo;
  /** 같은 가게·같은 품목 제보 수 (2 이상이면 교차 검증됨) */
  crossChecks: number;
  /** 이상치로 걸러진 제보인지 */
  outlier: boolean;
}

export interface StoreSummary {
  name: string;
  district: string;
  /** 이 가게에 쌓인 제보 수 */
  reportCount: number;
  /** 제보된 품목 수 */
  itemCount: number;
  /** 시세보다 싼 품목 수 — 가게의 "싼 집" 정도 */
  cheaperCount: number;
  /** 시세 대비 평균 차이(%). 음수 = 대체로 싼 가게 */
  avgDiffPct: number | null;
  /** 가장 최근 제보의 신선도 */
  freshness: FreshnessInfo;
}

/** 품목별 오늘 시세 맵 — 서버에서 받은 값을 그대로 넘긴다(클라에서 더미로 재계산하지 않도록). */
export type PriceMap = Record<string, number | null>;

/**
 * 한 가게의 품목별 최신 제보가 목록.
 * 같은 품목 제보가 여러 건이면 **가장 최신 1건**을 대표로 쓴다(가격은 시간에 민감하다).
 */
export function getStoreItems(
  reports: Report[],
  place: string,
  priceMap: PriceMap,
  todayIso: string,
): StoreItemPrice[] {
  const ofStore = reports.filter((r) => r.place === place);
  const latestByItem = new Map<string, Report>();
  for (const r of ofStore) {
    const prev = latestByItem.get(r.vegetableId);
    if (!prev || Date.parse(r.createdAt) > Date.parse(prev.createdAt)) {
      latestByItem.set(r.vegetableId, r);
    }
  }

  const items: StoreItemPrice[] = [];
  for (const [vegetableId, r] of latestByItem) {
    const veg = getVegetable(vegetableId);
    if (!veg) continue;
    const baselinePrice = priceMap[vegetableId] ?? null;
    const outlier = isOutlier(r.pricePerKg, baselinePrice);
    items.push({
      vegetableId,
      name: veg.name,
      emoji: veg.emoji,
      image: veg.image,
      unit: veg.unit,
      price: r.pricePerKg,
      baselinePrice,
      diffPct:
        baselinePrice && baselinePrice > 0
          ? Math.round(((r.pricePerKg - baselinePrice) / baselinePrice) * 1000) / 10
          : null,
      freshness: getFreshness(r.createdAt, todayIso),
      crossChecks: countCrossChecks(ofStore, place, vegetableId),
      outlier,
    });
  }

  // 시세보다 싼 품목이 위로 — "이 가게에서 뭘 사면 좋은지"가 먼저 읽혀야 한다
  return items.sort((a, b) => (a.diffPct ?? 0) - (b.diffPct ?? 0));
}

/** 동네 제보를 가게별로 요약한다(가게 목록·랭킹용). place 없는 제보는 집계에서 제외. */
export function summarizeStores(
  reports: Report[],
  priceMap: PriceMap,
  todayIso: string,
): StoreSummary[] {
  const byPlace = new Map<string, Report[]>();
  for (const r of reports) {
    if (!r.place) continue;
    const bucket = byPlace.get(r.place);
    if (bucket) bucket.push(r);
    else byPlace.set(r.place, [r]);
  }

  const summaries: StoreSummary[] = [];
  for (const [name, list] of byPlace) {
    const items = getStoreItems(list, name, priceMap, todayIso);
    const valid = items.filter((i) => !i.outlier && i.diffPct !== null);
    const avgDiffPct =
      valid.length > 0
        ? Math.round((valid.reduce((s, i) => s + (i.diffPct ?? 0), 0) / valid.length) * 10) / 10
        : null;
    const latest = list.reduce((acc, r) => (r.createdAt > acc.createdAt ? r : acc), list[0]);

    summaries.push({
      name,
      district: list[0].district,
      reportCount: list.length,
      itemCount: items.length,
      cheaperCount: valid.filter((i) => (i.diffPct ?? 0) < 0).length,
      avgDiffPct,
      freshness: getFreshness(latest.createdAt, todayIso),
    });
  }

  // 시세 대비 평균이 싼 가게 순 → 같으면 제보가 많은 순(근거가 두꺼운 쪽)
  return summaries.sort(
    (a, b) => (a.avgDiffPct ?? 999) - (b.avgDiffPct ?? 999) || b.reportCount - a.reportCount,
  );
}
