import "server-only";

import {
  favoriteStoresSchema,
  nearbyStoresSchema,
  storeReportsSchema,
  storeRecommendationSchema,
  type FavoriteStores,
  type NearbyStores,
  type StoreReports,
  type StoreRecommendation,
} from "../schemas/stores";
import {
  getFavoriteStores,
  getNearbyStores,
  getRecommendedStores,
  getStoreReports,
  type GetNearbyStoresParams,
} from "./stores";
import { DEFAULT_DISTRICT, VEGETABLES, getBaselineDummy } from "../../vegetables";
import { getFallbackNearbyStores, type NearbyStore as DummyNearbyStore } from "../../nearby-stores";
import { hasDedicatedVegetableIcon } from "../../vegetable-images";

/**
 * 전용 벡터가 있는 품목을 앞으로 오게 정렬한 카탈로그 — `items-fallback.ts`의
 * `reports-fallback.ts`와 같은 이유(생강처럼 재사용 벡터가 눈에 띄게 안 맞는 품목이
 * 홈 화면 더미에서 먼저 뽑히지 않게).
 */
const VEGETABLES_ICON_FIRST = [...VEGETABLES].sort(
  (left, right) => Number(hasDedicatedVegetableIcon(right.id)) - Number(hasDedicatedVegetableIcon(left.id)),
);

/**
 * 백엔드 `/api/v1/stores/nearby`가 아직 배포되지 않았거나(에러) DB에 가게 row가 없어
 * 빈 목록만 줄 때(정상 200) 화면 유지용으로만 쓰는 어댑터다. 실제 API가 안정되면 이 파일을
 * 삭제하고 `getNearbyStores`를 직접 호출하면 된다. 임시 응답도 `nearbyStoresSchema`로 검증해
 * 라이브 계약과 어긋나지 않게 한다.
 *
 * TODO(✍️): 스펙 확정 시 교체 — Spring stores API가 안정화되면 호출부의 fallback 분기를 제거한다.
 */

function storeIdForIndex(index: number): number {
  // 임시 목록에서만 쓰는 안정적인 숫자 ID다. 실제 storeId와 섞이지 않도록 더미 순번을
  // 그대로 사용하고, API가 연결되면 응답의 실제 storeId가 다시 사용된다.
  return index + 1;
}

/**
 * 요청받은 좌표를 중심으로 더미 가게를 흩뿌린다 — 전부 한 점에 겹치면 지도에서 구분이 안 된다.
 * `distanceMeters`를 반경(도) 오프셋으로 환산하고, 더미 개수만큼 각도를 균등 배분한다.
 */
function scatterAround(
  center: { latitude: number; longitude: number },
  distanceMeters: number,
  angleRadians: number,
): { latitude: number; longitude: number } {
  const METERS_PER_DEGREE_LAT = 111_320;
  const latOffset = (distanceMeters * Math.cos(angleRadians)) / METERS_PER_DEGREE_LAT;
  const lngOffset =
    (distanceMeters * Math.sin(angleRadians)) /
    (METERS_PER_DEGREE_LAT * Math.cos((center.latitude * Math.PI) / 180));
  return {
    latitude: center.latitude + latOffset,
    longitude: center.longitude + lngOffset,
  };
}

function buildTemporaryNearbyStore(
  dummy: DummyNearbyStore,
  index: number,
  total: number,
  center: { latitude: number; longitude: number },
  radius: number,
) {
  const angle = (2 * Math.PI * index) / total;
  const distanceMeters = Math.min(dummy.distanceM, radius);
  const { latitude, longitude } = scatterAround(center, distanceMeters, angle);

  return {
    storeId: storeIdForIndex(index),
    storeName: dummy.name,
    latitude,
    longitude,
    distanceMeters,
    isLiked: false,
  };
}

export interface TemporaryNearbyStoresParams {
  latitude: number;
  longitude: number;
  radius?: number;
}

export function buildTemporaryNearbyStores(params: TemporaryNearbyStoresParams): NearbyStores {
  const dummies = getFallbackNearbyStores(DEFAULT_DISTRICT);
  const center = { latitude: params.latitude, longitude: params.longitude };
  const radius = params.radius ?? 500;
  const stores = dummies.map((dummy, index) =>
    buildTemporaryNearbyStore(dummy, index, dummies.length, center, radius),
  );

  return nearbyStoresSchema.parse({
    totalCount: stores.length,
    stores,
  });
}

export function isTemporaryStoresDataError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("kind" in error)) return false;
  const kind = Reflect.get(error, "kind");
  return kind === "network" || kind === "upstream" || kind === "server" || kind === "parse" || kind === "notFound";
}

/**
 * DB에 아직 가게 row가 없으면 Spring이 정상 200으로 **빈 목록**을 준다 — 에러가 아니라서
 * `isTemporaryStoresDataError`로는 못 잡는다. 그래서 성공 응답이라도 `stores`가 비어 있으면
 * 같은 더미로 폴백한다.
 */
export async function getNearbyStoresWithTemporaryFallback(
  params: GetNearbyStoresParams,
): Promise<{ stores: NearbyStores; isTemporary: boolean }> {
  try {
    const stores = await getNearbyStores(params);
    if (stores.stores.length > 0) return { stores, isTemporary: false };
    console.warn("[stores] temporary data fallback (empty upstream result)", {
      latitude: params.latitude,
      longitude: params.longitude,
    });
    return { stores: buildTemporaryNearbyStores(params), isTemporary: true };
  } catch (error) {
    if (!isTemporaryStoresDataError(error)) throw error;
    console.warn("[stores] temporary data fallback", {
      endpoint: error && typeof error === "object" ? Reflect.get(error, "endpoint") : undefined,
    });
    return { stores: buildTemporaryNearbyStores(params), isTemporary: true };
  }
}

// ── 단골 가게 목록 (F04 찜 「가게」 탭 · 마이페이지) ─────────────────────────────────

function buildTemporaryFavoriteStores(): FavoriteStores {
  const dummies = getFallbackNearbyStores(DEFAULT_DISTRICT);
  const stores = dummies.map((dummy, index) => ({
    storeId: storeIdForIndex(index),
    storeName: dummy.name,
    storeImageUrl: null,
    distanceMeters: dummy.distanceM,
    // 코드값 자리다 — 표시 문구("영업중")를 넣으면 라벨 매핑이 미지 값으로 떨어진다.
    openStatus: "OPEN",
    todayBusinessHours: "09:00 - 22:00",
    isLiked: true,
  }));

  return favoriteStoresSchema.parse({
    stores,
    page: 0,
    size: stores.length,
    totalElements: stores.length,
    totalPages: 1,
    hasNext: false,
  });
}

export async function getFavoriteStoresWithTemporaryFallback(
  params: Parameters<typeof getFavoriteStores>[0],
): Promise<{ stores: FavoriteStores; isTemporary: boolean }> {
  try {
    const stores = await getFavoriteStores(params);
    if (stores.stores.length > 0) return { stores, isTemporary: false };
    console.warn("[stores] favorite-stores temporary data fallback (empty upstream result)");
    return { stores: buildTemporaryFavoriteStores(), isTemporary: true };
  } catch (error) {
    if (!isTemporaryStoresDataError(error)) throw error;
    console.warn("[stores] favorite-stores temporary data fallback", {
      endpoint: error && typeof error === "object" ? Reflect.get(error, "endpoint") : undefined,
    });
    return { stores: buildTemporaryFavoriteStores(), isTemporary: true };
  }
}

// ── 가게별 가격 제보 (F03-3 가게 상세 「저렴해요」·「비싸요」) ───────────────────────

function buildTemporaryStoreReports(storeId: number): StoreReports {
  const sample = VEGETABLES_ICON_FIRST.slice(0, 8);
  const reports = sample.map((vegetable, index) => {
    const baseline = getBaselineDummy(vegetable.id);
    const cheap = index % 2 === 0;
    const diff = cheap ? -Math.round(baseline.current * 0.1) : Math.round(baseline.current * 0.1);
    return {
      reportId: index + 1,
      itemId: index + 1,
      itemName: vegetable.name,
      itemImageUrl: null,
      price: baseline.current + diff,
      unit: vegetable.unit,
      reportedDate: baseline.asOf,
      publicPriceDiff: diff,
      // ⚠️ **퍼센트**다 (-10 = -10%). 예전엔 비율(-0.1)을 넣었는데 화면 포맷터
      //    (`stores/[storeId]/_data.ts` formatTrend)는 이 값을 퍼센트로 읽어서,
      //    2,490→2,241(-10%) 제보가 화면에 **"-0.1%"** 로 나오고 있었다(2026-08-21 수정).
      priceDiffRate: baseline.current === 0 ? 0 : (diff / baseline.current) * 100,
      // 제보자 정보는 아직 계약이 없다 — 더미도 채우지 않는다. 화면이 "제보자 정보 없음"을
      // 그려서 지금 무엇이 비어 있는지가 화면에 드러나게 둔다.
      reporterNickname: null,
      reporterRank: null,
      reporterProfileColor: null,
      priceClassification: cheap ? ("CHEAP" as const) : ("EXPENSIVE" as const),
    };
  });

  return storeReportsSchema.parse({
    storeId,
    summary: {
      cheapCount: reports.filter((report) => report.priceClassification === "CHEAP").length,
      expensiveCount: reports.filter((report) => report.priceClassification === "EXPENSIVE").length,
    },
    reports,
    page: 0,
    size: reports.length,
    hasNext: false,
  });
}

export async function getStoreReportsWithTemporaryFallback(
  params: Parameters<typeof getStoreReports>[0],
): Promise<{ reports: StoreReports; isTemporary: boolean }> {
  try {
    const reports = await getStoreReports(params);
    if (reports.reports.length > 0) return { reports, isTemporary: false };
    console.warn("[stores] store-reports temporary data fallback (empty upstream result)", {
      storeId: params.storeId,
    });
    return { reports: buildTemporaryStoreReports(params.storeId), isTemporary: true };
  } catch (error) {
    if (!isTemporaryStoresDataError(error)) throw error;
    console.warn("[stores] store-reports temporary data fallback", {
      storeId: params.storeId,
      endpoint: error && typeof error === "object" ? Reflect.get(error, "endpoint") : undefined,
    });
    return { reports: buildTemporaryStoreReports(params.storeId), isTemporary: true };
  }
}

// ── 제보 가격이 저렴한 주변 가게 (F01 홈 추천 카드) ──────────────────────────────────

function buildTemporaryRecommendedStores(): StoreRecommendation {
  const dummies = getFallbackNearbyStores(DEFAULT_DISTRICT);
  const cheapNames = VEGETABLES_ICON_FIRST.slice(0, 5).map((vegetable) => vegetable.name);
  const stores = dummies.map((dummy, index) => ({
    storeId: storeIdForIndex(index),
    storeName: dummy.name,
    latitude: null,
    longitude: null,
    addressName: null,
    roadAddressName: null,
    phone: null,
    placeUrl: null,
    distanceMeters: dummy.distanceM,
    cheapItemCount: cheapNames.length,
    cheapItems: cheapNames,
    remainingItemCount: 0,
  }));

  return storeRecommendationSchema.parse({
    totalCount: stores.length,
    stores,
  });
}

export async function getRecommendedStoresWithTemporaryFallback(
  params: Parameters<typeof getRecommendedStores>[0],
): Promise<{ stores: StoreRecommendation; isTemporary: boolean }> {
  try {
    const stores = await getRecommendedStores(params);
    if (stores.stores.length > 0) return { stores, isTemporary: false };
    console.warn("[stores] recommended-stores temporary data fallback (empty upstream result)", {
      regionId: params.regionId,
    });
    return { stores: buildTemporaryRecommendedStores(), isTemporary: true };
  } catch (error) {
    if (!isTemporaryStoresDataError(error)) throw error;
    console.warn("[stores] recommended-stores temporary data fallback", {
      regionId: params.regionId,
      endpoint: error && typeof error === "object" ? Reflect.get(error, "endpoint") : undefined,
    });
    return { stores: buildTemporaryRecommendedStores(), isTemporary: true };
  }
}
