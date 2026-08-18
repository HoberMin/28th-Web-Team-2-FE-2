import {
  type ItemCategory,
  type ItemSort,
} from "@/app/_lib/api/schemas/items";
import type { VegetableGroup } from "@/app/_lib/types";

export const PRICE_GROUPS = [
  { label: "감자·뿌리", category: "ROOT_VEGETABLES" },
  { label: "잎채소", category: "LEAFY_GREENS" },
  { label: "열매채소", category: "FRUITING_VEGETABLES" },
  { label: "고추", category: "PEPPERS" },
  { label: "양념", category: "SEASONINGS" },
  { label: "버섯", category: "MUSHROOMS" },
  { label: "과채", category: "FRUITS" },
] as const satisfies readonly { label: VegetableGroup; category: ItemCategory }[];

export const PRICES_SORT_OPTIONS = [
  { value: "name", label: "가나다순", apiSort: "NAME_ASC" },
  { value: "price-asc", label: "낮은 가격순", apiSort: "PRICE_ASC" },
  { value: "price-desc", label: "높은 가격순", apiSort: "PRICE_DESC" },
] as const satisfies readonly { value: string; label: string; apiSort: ItemSort }[];

export type PricesSortKey = (typeof PRICES_SORT_OPTIONS)[number]["value"];
export const DEFAULT_PRICES_SORT: PricesSortKey = "name";

export function normalizeSort(raw: string | undefined): PricesSortKey {
  return (
    PRICES_SORT_OPTIONS.find((option) => option.value === raw)?.value ?? DEFAULT_PRICES_SORT
  );
}

export function mapSortToApi(sort: PricesSortKey): ItemSort {
  return PRICES_SORT_OPTIONS.find((option) => option.value === sort)?.apiSort ?? "NAME_ASC";
}

export function normalizeGroup(raw: string | undefined): VegetableGroup | undefined {
  return PRICE_GROUPS.find((group) => group.label === raw)?.label;
}

export function mapGroupToApi(group: VegetableGroup | undefined): ItemCategory | undefined {
  return PRICE_GROUPS.find((option) => option.label === group)?.category;
}

export function mapCategoryCounts(
  counts: Record<string, number> | undefined,
): Record<VegetableGroup, number> {
  return {
    "감자·뿌리": counts?.ROOT_VEGETABLES ?? 0,
    잎채소: counts?.LEAFY_GREENS ?? 0,
    열매채소: counts?.FRUITING_VEGETABLES ?? 0,
    고추: counts?.PEPPERS ?? 0,
    양념: counts?.SEASONINGS ?? 0,
    버섯: counts?.MUSHROOMS ?? 0,
    과채: counts?.FRUITS ?? 0,
  };
}

export function getSortLabel(sort: PricesSortKey): string {
  return (
    PRICES_SORT_OPTIONS.find((option) => option.value === sort)?.label ??
    PRICES_SORT_OPTIONS[0].label
  );
}
