// F02 야채 시세 목록 파생 — 검색·카테고리·정렬을 서버에서 계산한다.
//
// 데이터는 **더미**다. `app/_lib/`의 기존 모듈(vegetables·trend·search·format)을 읽기만 하고
// 고치지 않는다. 실 API(KAMIS·제보)가 붙으면 `buildPriceRows`의 내부만 갈아끼우면 된다.

import { formatWon } from "../../_lib/format";
import { matchesVegetableName } from "../../_lib/search";
import { getDailyTrend } from "../../_lib/trend";
import type { VegetableGroup } from "../../_lib/types";
import {
  DEFAULT_DISTRICT,
  SEED_FAVORITES,
  VEGETABLES,
  VEGETABLE_GROUPS,
  getBaselineDummy,
  getNeighborhoodSeedReports,
  getVegetableGroup,
} from "../../_lib/vegetables";
import { PRICE_VEGETABLE_IMAGE_BY_ID } from "./_images";

/**
 * Figma 정렬시트(298-3546)의 옵션 3종. 라벨은 Figma 문구 그대로.
 *
 * ⚠️ **시안이 서로 모순이다.** 화면의 정렬 트리거 라벨은 `가나다순`인데, 같은 프레임에 겹쳐 있는
 *    정렬시트에서 체크된 항목은 `시세보다 저렴한 순`이다. 둘 중 하나를 골라야 해서
 *    **`가나다순`을 기본값으로 정했다** — 정렬시트가 없는 나머지 두 프레임(298-3421 기본 ·
 *    298-3448 검색)도 트리거에 `가나다순`을 달고 있어 3개 프레임 중 2개가 이 값이다.
 *    디자이너 확인 필요.
 */
export const PRICES_SORT_OPTIONS = [
  { value: "name", label: "가나다순" },
  { value: "cheap", label: "시세보다 저렴한 순" },
  { value: "recent", label: "최근 제보순" },
] as const;

export type PricesSortKey = (typeof PRICES_SORT_OPTIONS)[number]["value"];

export const DEFAULT_PRICES_SORT: PricesSortKey = "name";

export function normalizeSort(raw: string | undefined): PricesSortKey {
  const hit = PRICES_SORT_OPTIONS.find((option) => option.value === raw);
  return hit ? hit.value : DEFAULT_PRICES_SORT;
}

export function normalizeGroup(raw: string | undefined): VegetableGroup | undefined {
  return VEGETABLE_GROUPS.find((group) => group === raw);
}

export function getSortLabel(sort: PricesSortKey): string {
  const hit = PRICES_SORT_OPTIONS.find((option) => option.value === sort);
  return hit ? hit.label : PRICES_SORT_OPTIONS[0].label;
}

export type TrendState = "up" | "down" | "flat";

export interface PriceRow {
  id: string;
  name: string;
  image: string;
  group: VegetableGroup;
  /**
   * 찜 여부. Figma 기본 프레임(298-3421)의 3번째 카드가 찜 상태라 화면에 두 모습이 다 나와야 한다.
   * 값은 `app/_lib/favorites-store`의 서버 스냅샷과 같은 시드(`SEED_FAVORITES`)를 읽는다 —
   * 실제 찜은 localStorage(클라)라 RSC에서는 이 시드가 곧 첫 렌더 상태다.
   * ⚠️ 이 화면의 카드는 아직 **표시 전용**이다(토글 버튼 없음 — Figma에 조작 정의가 없다).
   */
  favorite: boolean;
  /** "2,490원" */
  price: string;
  /** "/1kg" */
  unit: string;
  trendState: TrendState;
  /**
   * 등락 금액·증감률.
   * ⚠️ flat이면 빈 문자열이다 — Figma의 `text/vegetable-trend` flat 심볼에는 값 텍스트가 아예 없고
   *    아이콘만 있다. 다만 `grid/vegetable-item`이 아직 state 축을 받지 않아(F04와 공유라 이번
   *    작업에서 못 고침) 코드에서는 빈 문자열로 같은 결과를 낸다.
   */
  trendAmount: string;
  trendPercent: string;
  /**
   * 동네 제보 최저가가 공공 시세보다 얼마나 싼지(%). 음수 = 시세보다 쌈.
   * 제보가 없으면 `Number.POSITIVE_INFINITY`로 두어 "저렴한 순"에서 뒤로 밀린다.
   */
  cheaperPct: number;
  /** 가장 최근 제보 시각(epoch ms). 제보가 없으면 0. */
  latestReportAt: number;
}

export interface PriceRowsResult {
  rows: PriceRow[];
  /** 시세 기준일 "YYYY-MM-DD" — 화면의 "N월 N일 기준" 표기에 쓴다. */
  asOf: string;
}

/**
 * 카탈로그 46종 × (더미 기준시세 + 동네 제보 시드)를 화면이 바로 쓸 수 있는 행으로 만든다.
 * 제보는 기본 동네(삼성동) 것만 본다 — 동네 전환 UI가 이 화면 시안에 없기 때문.
 */
export function buildPriceRows(): PriceRowsResult {
  const reports = getNeighborhoodSeedReports(DEFAULT_DISTRICT);

  const latestByVegetable = new Map<string, number>();
  const cheapestByVegetable = new Map<string, number>();
  for (const report of reports) {
    const at = Date.parse(report.createdAt);
    const latest = latestByVegetable.get(report.vegetableId);
    if (latest === undefined || at > latest) latestByVegetable.set(report.vegetableId, at);

    const cheapest = cheapestByVegetable.get(report.vegetableId);
    if (cheapest === undefined || report.pricePerKg < cheapest) {
      cheapestByVegetable.set(report.vegetableId, report.pricePerKg);
    }
  }

  let asOf = "";
  const rows = VEGETABLES.map((vegetable): PriceRow => {
    const baseline = getBaselineDummy(vegetable.id);
    if (!asOf) asOf = baseline.asOf;

    const trend = getDailyTrend(baseline.series.week);
    const trendState: TrendState = trend ? trend.direction : "flat";
    const cheapest = cheapestByVegetable.get(vegetable.id);

    return {
      id: vegetable.id,
      name: vegetable.name,
      image: PRICE_VEGETABLE_IMAGE_BY_ID[vegetable.id],
      group: getVegetableGroup(vegetable.id),
      favorite: SEED_FAVORITES.includes(vegetable.id),
      price: formatWon(baseline.current),
      unit: `/${vegetable.unit}`,
      trendState,
      trendAmount: trend && trendState !== "flat" ? formatWon(trend.diff) : "",
      // 방향을 색에만 맡기지 않도록 부호를 문자열에 담는다(WCAG 1.4.1).
      trendPercent:
        trend && trendState !== "flat" ? `(${trendState === "up" ? "+" : "-"}${trend.pct}%)` : "",
      cheaperPct:
        cheapest === undefined || baseline.current <= 0
          ? Number.POSITIVE_INFINITY
          : ((cheapest - baseline.current) / baseline.current) * 100,
      latestReportAt: latestByVegetable.get(vegetable.id) ?? 0,
    };
  });

  return { rows, asOf };
}

/** 카테고리 칩에 붙는 개수 — 검색어와 무관하게 **카탈로그 전체** 기준이다(Figma의 46/5/12와 동일). */
export function countByGroup(rows: readonly PriceRow[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const group of VEGETABLE_GROUPS) counts[group] = 0;
  for (const row of rows) counts[row.group] += 1;
  return counts;
}

export function filterRows(
  rows: readonly PriceRow[],
  { query, group }: { query: string; group?: VegetableGroup },
): PriceRow[] {
  return rows.filter(
    (row) => (!group || row.group === group) && matchesVegetableName(row.name, query),
  );
}

export function sortRows(rows: readonly PriceRow[], sort: PricesSortKey): PriceRow[] {
  const byName = (a: PriceRow, b: PriceRow) => a.name.localeCompare(b.name, "ko");
  const sorted = [...rows];
  switch (sort) {
    case "cheap":
      // 시세 대비 가장 많이 싼 제보가 있는 품목부터. 제보가 없으면 Infinity라 뒤로 밀린다.
      return sorted.sort((a, b) => a.cheaperPct - b.cheaperPct || byName(a, b));
    case "recent":
      return sorted.sort((a, b) => b.latestReportAt - a.latestReportAt || byName(a, b));
    case "name":
      return sorted.sort(byName);
  }
}
