// Spring 단골 가게 DTO → F04 「가게」 탭 행 표시 모델.
//
// 화면(`RowSavedStore`)은 문자열만 그린다. 숫자→문구 변환을 컴포넌트가 아니라 여기 모아 두는
// 이유는 마이페이지(F05)가 같은 API를 쓰기 때문이다 — 거리 표기가 화면마다 갈리면 안 된다.

import type { FavoriteStore } from "@/app/_lib/api/schemas/stores";
import {
  DEFAULT_STORE_BUSINESS_HOURS,
  DEFAULT_STORE_OPEN_LABEL,
} from "@/app/_lib/store-business-hours";
import type { SavedStoreOpenState } from "./_components/row-saved-store";

export interface SavedStoreView {
  id: string;
  name: string;
  /** 예: "0.2km". 좌표를 안 넘겼거나 서버가 거리를 안 주면 빈 문자열이다. */
  distance: string;
  openState: SavedStoreOpenState;
  openLabel: string;
  hours: string;
  imageUrl?: string;
}

/**
 * 1km 미만은 미터, 그 이상은 소수 첫째 자리 km.
 * 스펙이 `distanceMeters`를 optional로 두고 있어 없으면 자리를 비운다(0m로 속이지 않는다).
 */
export function formatDistance(distanceMeters: number | null | undefined): string {
  if (typeof distanceMeters !== "number" || !Number.isFinite(distanceMeters) || distanceMeters < 0) {
    return "";
  }
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)}m`;
  return `${(distanceMeters / 1000).toFixed(1)}km`;
}

export function mapFavoriteStoreToView(store: FavoriteStore): SavedStoreView {
  return {
    id: String(store.storeId),
    name: store.storeName,
    distance: formatDistance(store.distanceMeters),
    openState: "open",
    openLabel: DEFAULT_STORE_OPEN_LABEL,
    hours: DEFAULT_STORE_BUSINESS_HOURS,
    imageUrl: store.storeImageUrl?.trim() || undefined,
  };
}
