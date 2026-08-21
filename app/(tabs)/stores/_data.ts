import type { NearbyStore } from "@/app/_lib/api/schemas/stores";

export interface MapCenter {
  lat: number;
  lng: number;
}

export interface MapStore {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Kakao SDK를 사용할 수 없을 때 표시할 지도 영역 내 비율 좌표. */
  x: number;
  y: number;
  address?: string;
  phone?: string;
  distanceMeters?: number;
  isLiked: boolean;
}

function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Spring nearby DTO를 지도 화면 타입으로 좁힌다.
 *
 * x/y는 SDK 실패 시에만 쓰는 근사값이다. SDK가 준비되면 실제 위·경도를 projection해서 덮는다.
 */
export function mapNearbyStoreToMapStore(
  store: NearbyStore,
  center: MapCenter,
  radius: number,
): MapStore {
  const latitudeMeters = (store.latitude - center.lat) * 111_320;
  const longitudeMeters =
    (store.longitude - center.lng) * 111_320 * Math.cos((center.lat * Math.PI) / 180);
  const fallbackRadius = Math.max(radius, 1);

  return {
    id: String(store.storeId),
    name: store.storeName,
    lat: store.latitude,
    lng: store.longitude,
    x: clampPercentage(50 + (longitudeMeters / fallbackRadius) * 50),
    y: clampPercentage(50 - (latitudeMeters / fallbackRadius) * 50),
    address: store.roadAddressName || store.addressName || undefined,
    phone: store.phone || undefined,
    distanceMeters: store.distanceMeters,
    isLiked: store.isLiked,
  };
}

export function formatStoreDistance(distanceMeters: number | undefined): string | undefined {
  if (distanceMeters === undefined) return undefined;
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)}m`;
  return `${(distanceMeters / 1000).toFixed(1)}km`;
}

/**
 * 도보 시간. `StoreDetailResponse.walkTimeMinutes`가 백엔드에서 계산해 주면 그 값을 쓰고,
 * (2026-08-21 라이브 확인 — 스펙엔 있지만 아직 항상 `null`이다) 없으면 거리에서 추정한다.
 * 67m/분(≈4km/h) 도보 페이스는 Figma 목업 수치(670m·도보 10분)에서 역산한 값이다.
 */
const WALK_METERS_PER_MINUTE = 67;

export function formatWalkTime(
  walkTimeMinutes: number | null | undefined,
  distanceMeters: number | undefined,
): string {
  if (typeof walkTimeMinutes === "number" && walkTimeMinutes > 0) return `도보 ${walkTimeMinutes}분`;
  // `>= 0`이 맞다 — 가게 바로 앞(distanceMeters=0)도 유효한 거리다. `> 0`으로 걸러내면
  // "0m · " 뒤에 도보 시간 없이 구분점만 남는다(HeaderStoreDetail은 항상 점을 그린다).
  if (typeof distanceMeters === "number" && distanceMeters >= 0) {
    return `도보 ${Math.max(1, Math.round(distanceMeters / WALK_METERS_PER_MINUTE))}분`;
  }
  return "";
}
