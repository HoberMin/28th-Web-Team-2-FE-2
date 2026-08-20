import "server-only";

import {
  itemDetailSchema,
  itemPageSchema,
  type ItemCategory,
  type ItemDetail,
  type ItemPage,
  type ItemSort,
} from "../schemas/items";
import {
  getItemDetail,
  getItems,
  type GetItemDetailParams,
  type GetItemsParams,
} from "./items";
import { getDailyTrend } from "../../trend";
import { matchesVegetableName } from "../../search";
import {
  DEFAULT_DISTRICT,
  VEGETABLES,
  getBaselineDummy,
  getNeighborhoodSeedReports,
  getOnlinePrices,
  getVegetableGroup,
} from "../../vegetables";
import type { VegetableGroup } from "../../types";

/**
 * 백엔드 `/api/v1/items`가 아직 배포되지 않았거나 일시적으로 연결되지 않을 때만 쓰는
 * 화면 유지용 어댑터다. 실제 API가 준비되면 이 파일을 삭제하고 `getItems`를 직접 호출하면
 * 된다. 임시 응답도 `itemPageSchema`/`itemDetailSchema`로 검증해 라이브 계약과 어긋나지 않게 한다.
 *
 * TODO(✍️): 스펙 확정 시 교체 — Spring items API가 안정화되면 호출부의 fallback 분기를 제거한다.
 */

const GROUP_TO_CATEGORY: Record<VegetableGroup, ItemCategory> = {
  뿌리채소: "ROOT_VEGETABLES",
  잎채소: "LEAFY_GREENS",
  열매채소: "FRUITING_VEGETABLES",
  고추류: "PEPPERS",
  "마늘·파·생강": "SEASONINGS",
  버섯류: "MUSHROOMS",
  과일류: "FRUITS",
};

const CATEGORY_TO_GROUP = Object.fromEntries(
  Object.entries(GROUP_TO_CATEGORY).map(([group, category]) => [category, group]),
) as Record<ItemCategory, VegetableGroup>;

export interface TemporaryItemsParams {
  page?: number;
  size?: number;
  sort?: ItemSort;
  keyword?: string;
  category?: ItemCategory;
}

function itemIdForIndex(index: number): number {
  // 임시 목록에서만 쓰는 안정적인 숫자 ID다. 라이브 itemId와 섞이지 않도록 카탈로그 순번을
  // 그대로 사용하고, API가 연결되면 응답의 실제 itemId가 다시 사용된다.
  return index + 1;
}

function buildTemporaryItem(index: number) {
  const vegetable = VEGETABLES[index];
  const baseline = getBaselineDummy(vegetable.id);
  const trend = getDailyTrend(baseline.series.week);
  const priceGap = trend
    ? trend.direction === "up"
      ? trend.diff
      : trend.direction === "down"
        ? -trend.diff
        : 0
    : null;
  const priceDiffRate = trend
    ? trend.direction === "up"
      ? trend.pct
      : trend.direction === "down"
        ? -trend.pct
        : 0
    : null;

  return {
    itemId: itemIdForIndex(index),
    itemName: vegetable.name,
    itemImageUrl: null,
    defaultUnit: vegetable.unit,
    price: baseline.current,
    priceGap,
    priceDiffRate,
    isLiked: false,
  };
}

function sortIndexes(indexes: number[], sort: ItemSort): number[] {
  return indexes.toSorted((left, right) => {
    const leftVegetable = VEGETABLES[left];
    const rightVegetable = VEGETABLES[right];
    if (sort === "NAME_ASC") return leftVegetable.name.localeCompare(rightVegetable.name, "ko");

    const leftPrice = getBaselineDummy(leftVegetable.id).current;
    const rightPrice = getBaselineDummy(rightVegetable.id).current;
    const priceOrder = sort === "PRICE_ASC" ? leftPrice - rightPrice : rightPrice - leftPrice;
    return priceOrder || leftVegetable.name.localeCompare(rightVegetable.name, "ko");
  });
}

function categoryCounts(): Record<ItemCategory, number> {
  const counts = Object.fromEntries(
    Object.values(GROUP_TO_CATEGORY).map((category) => [category, 0]),
  ) as Record<ItemCategory, number>;
  for (const vegetable of VEGETABLES) {
    const group = getVegetableGroup(vegetable.id);
    counts[GROUP_TO_CATEGORY[group]] += 1;
  }
  return counts;
}

export function buildTemporaryItemPage({
  page = 0,
  size = 18,
  sort = "NAME_ASC",
  keyword,
  category,
}: TemporaryItemsParams): ItemPage {
  const normalizedKeyword = keyword?.trim() ?? "";
  const indexes = VEGETABLES.map((vegetable, index) => ({ vegetable, index }))
    .filter(({ vegetable }) =>
      !category || CATEGORY_TO_GROUP[category] === getVegetableGroup(vegetable.id),
    )
    .filter(({ vegetable }) => matchesVegetableName(vegetable.name, normalizedKeyword))
    .map(({ index }) => index);
  const sortedIndexes = sortIndexes(indexes, sort);
  const safePage = Math.max(0, page);
  const safeSize = Math.max(1, Math.min(size, 100));
  const start = safePage * safeSize;
  const items = sortedIndexes
    .slice(start, start + safeSize)
    .map((index) => buildTemporaryItem(index));
  const baseDate = getBaselineDummy(VEGETABLES[0].id).asOf;

  return itemPageSchema.parse({
    baseDate,
    totalCount: sortedIndexes.length,
    categoryCounts: categoryCounts(),
    items,
    page: safePage,
    size: safeSize,
    hasNext: start + safeSize < sortedIndexes.length,
  });
}

export function buildTemporaryItemDetail(itemId: number): ItemDetail | null {
  const index = itemId - 1;
  const vegetable = VEGETABLES[index];
  if (!vegetable) return null;

  const baseline = getBaselineDummy(vegetable.id);
  const reports = getNeighborhoodSeedReports(DEFAULT_DISTRICT)
    .filter((report) => report.vegetableId === vegetable.id)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  const online = getOnlinePrices(vegetable.id);
  const trend = getDailyTrend(baseline.series.week);
  const detail = {
    itemId,
    itemName: vegetable.name,
    itemImageUrl: null,
    defaultUnit: vegetable.unit,
    isLiked: false,
    latestLocalReportPrice: reports[0]?.pricePerKg ?? null,
    todayPublicPrice: baseline.current,
    onlineLowestPrice: online?.cheapest.price ?? null,
    baseDate: baseline.asOf,
    priceGap: trend
      ? trend.direction === "up"
        ? trend.diff
        : trend.direction === "down"
          ? -trend.diff
          : 0
      : null,
    priceDiffRate: trend
      ? trend.direction === "up"
        ? trend.pct
        : trend.direction === "down"
          ? -trend.pct
          : 0
      : null,
  };

  return itemDetailSchema.parse(detail);
}

export function isTemporaryDataError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("kind" in error)) return false;
  const kind = Reflect.get(error, "kind");
  return kind === "network" || kind === "upstream" || kind === "server" || kind === "parse" || kind === "notFound";
}

/**
 * DB에 아직 실데이터가 없으면 Spring이 정상 200으로 **빈 목록**을 준다 — `isTemporaryDataError`는
 * 이 케이스를 못 잡는다(에러가 아니라서). 그래서 성공 응답이라도 `items`가 비어 있으면 같은
 * 더미로 폴백한다. `keyword`/`category` 필터 때문에 정당하게 0건인 경우와는 구분하지 않는다 —
 * `buildTemporaryItemPage`가 같은 필터를 46종 카탈로그에도 적용하므로, 진짜로 일치하는 야채가
 * 없는 검색어는 더미 쪽에서도 그대로 0건이 나온다.
 */
export async function getItemsWithTemporaryFallback(
  params: GetItemsParams,
): Promise<{ page: ItemPage; isTemporary: boolean }> {
  try {
    const page = await getItems(params);
    if (page.items.length > 0) return { page, isTemporary: false };
    console.warn("[items] temporary data fallback (empty upstream result)", {
      regionId: params.regionId,
    });
    return { page: buildTemporaryItemPage(params), isTemporary: true };
  } catch (error) {
    if (!isTemporaryDataError(error)) throw error;
    console.warn("[items] temporary data fallback", {
      endpoint: error && typeof error === "object" ? Reflect.get(error, "endpoint") : undefined,
    });
    return {
      page: buildTemporaryItemPage(params),
      isTemporary: true,
    };
  }
}

export async function getItemDetailWithTemporaryFallback(
  params: GetItemDetailParams,
): Promise<{ detail: ItemDetail; isTemporary: boolean }> {
  try {
    return { detail: await getItemDetail(params), isTemporary: false };
  } catch (error) {
    if (!isTemporaryDataError(error)) throw error;
    const detail = buildTemporaryItemDetail(params.itemId);
    if (!detail) throw error;
    console.warn("[item-detail] temporary data fallback", {
      itemId: params.itemId,
      endpoint: error && typeof error === "object" ? Reflect.get(error, "endpoint") : undefined,
    });
    return { detail, isTemporary: true };
  }
}
