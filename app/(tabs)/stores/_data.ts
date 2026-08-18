import type { NearbyStore } from "@/app/_lib/api/schemas/stores";
import type { BadgeReportDateVariant } from "../../_components/badge-report-date";

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

/** 지역 선택 서버 경계가 합쳐지기 전까지 유지하는 표시용 기본값. */
export const MAP_REGION = "광진구";

/** F03 카카오맵의 최초 중심. */
export const MAP_CENTER: MapCenter = { lat: 37.5384, lng: 127.0822 };

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
 * 상세·찜 prototype 전용 더미 타입. nearby mapper는 아래 계약 밖 필드를 절대 채우지 않는다.
 */
export interface PrototypeMapStore extends MapStore {
  openState: string;
  openHours: string;
  distance: string;
  walkTime: string;
  affordableCount: number;
  todayReportCount: number;
  reports: Array<{
    id: string;
    name: string;
    date: BadgeReportDateVariant;
    price: string;
    unit: string;
  }>;
}

const MAP_LAT_SPAN = 0.013;
const MAP_LNG_SPAN = 0.017;

function prototypeCoordinate(x: number, y: number): { lat: number; lng: number } {
  return {
    lat: MAP_CENTER.lat + ((50 - y) / 100) * MAP_LAT_SPAN,
    lng: MAP_CENTER.lng + ((x - 50) / 100) * MAP_LNG_SPAN,
  };
}

/** 기존 상세·찜 prototype이 사용하는 데이터. 실 nearby 지도에는 전달하지 않는다. */
export const MAP_STORES: PrototypeMapStore[] = [
  {
    id: "nh-haniro",
    name: "농협하나로마트",
    ...prototypeCoordinate(50, 44.1),
    x: 50,
    y: 44.1,
    isLiked: false,
    openState: "영업중",
    openHours: "수 10:00 - 22:00",
    distance: "670m",
    walkTime: "도보 10분",
    affordableCount: 4,
    todayReportCount: 1,
    reports: [
      { id: "nh-1", name: "양파", date: "today", price: "99,900원", unit: "/100kg" },
      { id: "nh-2", name: "양파", date: "yesterday", price: "99,900원", unit: "/100kg" },
    ],
  },
  {
    id: "happy-super",
    name: "행복슈퍼마켓",
    ...prototypeCoordinate(13.8, 36.2),
    x: 13.8,
    y: 36.2,
    isLiked: true,
    openState: "영업중",
    openHours: "수 09:00 - 21:00",
    distance: "320m",
    walkTime: "도보 5분",
    affordableCount: 2,
    todayReportCount: 3,
    reports: [
      { id: "hs-1", name: "감자", date: "today", price: "3,200원", unit: "/1kg" },
      { id: "hs-2", name: "대파", date: "today", price: "2,480원", unit: "/1단" },
    ],
  },
  {
    id: "uri-cheonggwa",
    name: "우리동네청과",
    ...prototypeCoordinate(78.7, 52.8),
    x: 78.7,
    y: 52.8,
    isLiked: false,
    openState: "영업종료",
    openHours: "수 08:00 - 19:00",
    distance: "1.2km",
    walkTime: "도보 18분",
    affordableCount: 5,
    todayReportCount: 0,
    reports: [],
  },
  {
    id: "jayang-market",
    name: "자양시장 채소가게 2호점",
    ...prototypeCoordinate(25.9, 63.4),
    x: 25.9,
    y: 63.4,
    isLiked: true,
    openState: "영업중",
    openHours: "수 07:00 - 20:00",
    distance: "850m",
    walkTime: "도보 13분",
    affordableCount: 3,
    todayReportCount: 2,
    reports: [
      { id: "jm-1", name: "오이", date: "today", price: "1,190원", unit: "/1개" },
      { id: "jm-2", name: "애호박", date: "yesterday", price: "1,980원", unit: "/1개" },
    ],
  },
];
