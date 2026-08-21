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
  getPublicPriceTrend,
  type GetItemDetailParams,
  type GetItemsParams,
} from "./items";
import { compareWithOneMonthAgo } from "../../monthly-price-comparison";
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

/**
 * 표기 구두점 차이를 무시하고 비교하기 위한 정규화. 더미 카탈로그는 "고춧가루(국산)"처럼
 * 괄호를 쓰는데 실제 Spring 응답은 "고춧가루-국산"처럼 하이픈을 써서 정확 일치가 깨지는
 * 사례가 실제로 있었다(사용자 신고로 발견) — 괄호·하이픈·공백을 지우고 비교한다.
 */
function normalizeVegetableName(name: string): string {
  return name.replace(/[()（）\-\s]/g, "");
}

/**
 * 실제 Spring 응답의 itemName으로 46종 더미 카탈로그 항목을 찾는다(itemId 순번이 아니라
 * 이름으로 맞춘다 — 실제 itemId가 더미 카탈로그의 1~46 순번과 정렬된다는 보장이 없다).
 * 정확히 일치하는 게 없으면 구두점을 무시한 정규화 비교로 한 번 더 찾는다.
 */
function findDummyVegetableByName(itemName: string) {
  const exact = VEGETABLES.find((vegetable) => vegetable.name === itemName);
  if (exact) return exact;
  const normalized = normalizeVegetableName(itemName);
  return VEGETABLES.find((vegetable) => normalizeVegetableName(vegetable.name) === normalized);
}

function temporaryPriceFields(vegetableId: string) {
  const baseline = getBaselineDummy(vegetableId);
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
  return { price: baseline.current, priceGap, priceDiffRate, baseDate: baseline.asOf };
}

/**
 * 품목 자체(이름·이미지·itemId·찜 여부)는 실 응답 그대로 두고, **가격만 null인 경우에**
 * 이름이 일치하는 더미로 채운다. DB에 품목 마스터는 있는데 시세 적재가 아직 안 된 상태
 * (가격만 전부 null)를 겨냥한 것이다 — 계절 품목이라 정말로 가격이 없는 경우와는 구분할
 * 수 없지만, 지금은 화면 구조를 보여주는 게 우선이라 이름이 맞으면 채운다.
 */
function withTemporaryPriceIfMissing(item: ItemPage["items"][number]): ItemPage["items"][number] {
  if (item.price !== null) return item;
  const vegetable = findDummyVegetableByName(item.itemName);
  if (!vegetable) return item;
  const { price, priceGap, priceDiffRate } = temporaryPriceFields(vegetable.id);
  return { ...item, price, priceGap, priceDiffRate, isTemporary: true };
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
    isTemporary: true,
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
  options: { includeMonthlyComparison?: boolean } = {},
): Promise<{ page: ItemPage; isTemporary: boolean }> {
  const decorate = (result: { page: ItemPage; isTemporary: boolean }) =>
    options.includeMonthlyComparison ? addMonthlyComparisons(result, params.regionId) : result;

  try {
    const page = await getItems(params);
    if (page.items.length === 0) {
      console.warn("[items] temporary data fallback (empty upstream result)", {
        regionId: params.regionId,
      });
      return decorate({ page: buildTemporaryItemPage(params), isTemporary: true });
    }

    // 목록은 실데이터인데 가격 필드만 비어 있는 경우(품목 마스터는 있고 시세 적재가 안 됨) —
    // 실 itemId·이름·이미지는 그대로 두고 가격만 이름 매칭 더미로 채운다.
    const hasMissingPrice = page.items.some((item) => item.price === null);
    if (!hasMissingPrice) return decorate({ page, isTemporary: false });
    console.warn("[items] temporary price fallback (upstream price fields empty)", {
      regionId: params.regionId,
    });
    return decorate({
      page: { ...page, items: page.items.map(withTemporaryPriceIfMissing) },
      isTemporary: true,
    });
  } catch (error) {
    if (!isTemporaryDataError(error)) throw error;
    console.warn("[items] temporary data fallback", {
      endpoint: error && typeof error === "object" ? Reflect.get(error, "endpoint") : undefined,
    });
    return decorate({
      page: buildTemporaryItemPage(params),
      isTemporary: true,
    });
  }
}

async function addMonthlyComparisons(
  result: { page: ItemPage; isTemporary: boolean },
  regionId: string,
): Promise<{ page: ItemPage; isTemporary: boolean }> {
  const items = await Promise.all(
    result.page.items.map(async (item) => {
      if (item.isTemporary) {
        const vegetable = findDummyVegetableByName(item.itemName);
        const points = vegetable ? getBaselineDummy(vegetable.id).series.year : [];
        const comparison = compareWithOneMonthAgo(points, item.price);
        return comparison
          ? { ...item, monthlyPriceGap: comparison.diff, monthlyPriceDiffRate: comparison.percent }
          : item;
      }

      try {
        const trend = await getPublicPriceTrend({ itemId: item.itemId, regionId, period: "YEAR" });
        const comparison = compareWithOneMonthAgo(trend.points, item.price);
        return comparison
          ? { ...item, monthlyPriceGap: comparison.diff, monthlyPriceDiffRate: comparison.percent }
          : item;
      } catch {
        return item;
      }
    }),
  );
  return { ...result, page: { ...result.page, items } };
}

/**
 * DB에 이 품목의 시세·제보가 하나도 없으면 Spring은 200과 함께 수치 필드를 전부 `null`로
 * 준다(품목 자체는 카탈로그에 있으니 `itemId`/`itemName`은 채워진다). 그 상태를 "비어 있다"로
 * 본다 — 목록의 "success인데 빈 배열" 판정과 같은 결의 문제다.
 */
function isEmptyItemDetail(detail: ItemDetail): boolean {
  return (
    detail.todayPublicPrice == null &&
    detail.latestLocalReportPrice == null &&
    detail.onlineLowestPrice == null &&
    detail.baseDate == null
  );
}

/**
 * 실 상세(itemId·itemName·itemImageUrl·isLiked)는 그대로 두고, 수치 필드만 이름이 일치하는
 * 더미로 채운다 — `itemId`가 46종 순번과 정렬된다는 보장이 없어 이름으로 찾는다.
 */
function withTemporaryPriceFields(detail: ItemDetail): ItemDetail | null {
  const vegetable = findDummyVegetableByName(detail.itemName);
  if (!vegetable) return null;
  const reports = getNeighborhoodSeedReports(DEFAULT_DISTRICT)
    .filter((report) => report.vegetableId === vegetable.id)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  const online = getOnlinePrices(vegetable.id);
  const { price, priceGap, priceDiffRate, baseDate } = temporaryPriceFields(vegetable.id);
  return {
    ...detail,
    latestLocalReportPrice: reports[0]?.pricePerKg ?? null,
    todayPublicPrice: price,
    onlineLowestPrice: online?.cheapest.price ?? null,
    baseDate,
    priceGap,
    priceDiffRate,
  };
}

export async function getItemDetailWithTemporaryFallback(
  params: GetItemDetailParams,
): Promise<{ detail: ItemDetail; isTemporary: boolean }> {
  try {
    const detail = await getItemDetail(params);
    if (!isEmptyItemDetail(detail)) return { detail, isTemporary: false };
    const patched = withTemporaryPriceFields(detail);
    // 이름이 46종 임시 카탈로그에 없으면 채울 더미가 없다 — 빈 실응답을 그대로 둔다.
    if (!patched) return { detail, isTemporary: false };
    console.warn("[item-detail] temporary data fallback (empty upstream result)", {
      itemId: params.itemId,
    });
    return { detail: patched, isTemporary: true };
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
