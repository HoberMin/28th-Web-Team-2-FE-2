import "server-only";

import { nearbyStoresSchema, type NearbyStores } from "../schemas/stores";
import { DEFAULT_DISTRICT } from "../../vegetables";
import { getFallbackNearbyStores, type NearbyStore as DummyNearbyStore } from "../../nearby-stores";

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
