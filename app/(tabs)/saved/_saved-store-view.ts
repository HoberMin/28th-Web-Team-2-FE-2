// Spring 단골 가게 DTO → F04 「가게」 탭 행 표시 모델.
//
// 화면(`RowSavedStore`)은 문자열만 그린다. 숫자→문구 변환을 컴포넌트가 아니라 여기 모아 두는
// 이유는 마이페이지(F05)가 같은 API를 쓰기 때문이다 — 거리 표기가 화면마다 갈리면 안 된다.

import type { FavoriteStore } from "@/app/_lib/api/schemas/stores";
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

/**
 * `openStatus`는 스펙에 enum이 없어 어떤 문자열이 오는지 확정할 수 없다
 * (`backend-api-reference` — 스펙에 없는 걸 상상하지 않는다). 그래서 **영업중으로 읽히는
 * 값만 화이트리스트**로 판정하고, 모르는 값은 문구를 그대로 보여주되 색은 종료 쪽으로 둔다.
 * 색이 정보를 단독으로 나르지 않으므로(문구가 같이 있다) 오판정의 손해가 작은 방향이다.
 */
const OPEN_STATUS_LABELS: Record<string, { state: SavedStoreOpenState; label: string }> = {
  OPEN: { state: "open", label: "영업중" },
  OPENING: { state: "open", label: "영업중" },
  CLOSED: { state: "closed", label: "영업종료" },
  CLOSING_SOON: { state: "open", label: "곧 영업종료" },
  UNKNOWN: { state: "closed", label: "영업정보 없음" },
};

export function mapFavoriteStoreToView(store: FavoriteStore): SavedStoreView {
  const status = store.openStatus?.trim();
  const known = status ? OPEN_STATUS_LABELS[status.toUpperCase()] : undefined;

  return {
    id: String(store.storeId),
    name: store.storeName,
    distance: formatDistance(store.distanceMeters),
    openState: known?.state ?? "closed",
    openLabel: known?.label ?? status ?? "영업정보 없음",
    hours: store.todayBusinessHours?.trim() || "영업시간 정보 없음",
    imageUrl: store.storeImageUrl?.trim() || undefined,
  };
}
