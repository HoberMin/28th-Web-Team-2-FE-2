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
