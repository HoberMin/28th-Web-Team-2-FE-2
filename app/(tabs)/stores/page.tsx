import type { Metadata } from "next";
import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { DEFAULT_NEARBY_STORE_RADIUS } from "@/app/_lib/api/schemas/stores";
import { getNearbyStores } from "@/app/_lib/api/server/stores";
import { MAP_CENTER, MAP_REGION, mapNearbyStoreToMapStore } from "./_data";
import { StoresMapView } from "./_map-view";
import {
  createNearbyStoresRequestKey,
  type NearbyStoresState,
} from "./_nearby-state";

// F03 동네가게 (Figma `화면GUI` 298:3605 · 3617 · 3630 · 3643).
//
// Server Component다 — 이 파일은 화면 껍데기만 고르고, 화면의 모든 인터랙션
// (지도 이동 · 마커 선택 · 찜 필터 · 검색)은 `_map-view.tsx` 하나에 모여 있다
// (conventions #10 — "use client"는 정말 필요한 leaf에만).
// 지도 중심이 브라우저에서 계속 바뀌므로 가게 목록은 Client leaf가 same-origin BFF로 조회한다.
//
// GNB는 여기서 그리지 않는다 — `(tabs)/layout.tsx`가 소유한다.

export const metadata: Metadata = {
  title: "동네 가게",
};

export async function loadInitialNearbyStores(): Promise<NearbyStoresState> {
  const token = await getAccessToken();
  const request = {
    center: MAP_CENTER,
    radius: DEFAULT_NEARBY_STORE_RADIUS,
    keyword: "",
    onlyLiked: false,
  };
  const key = createNearbyStoresRequestKey(request);

  try {
    const result = await getNearbyStores({
      latitude: request.center.lat,
      longitude: request.center.lng,
      radius: request.radius,
      onlyLiked: request.onlyLiked,
      token,
    });
    return {
      key,
      stores: result.stores.map((store) =>
        mapNearbyStoreToMapStore(store, request.center, request.radius),
      ),
      status: "success",
      error: null,
    };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return {
      key,
      stores: [],
      status: "error",
      error: "주변 가게를 불러오지 못했어요.",
    };
  }
}

export default async function StoresPage() {
  const initialNearbyState = await loadInitialNearbyStores();
  return <StoresMapView region={MAP_REGION} initialNearbyState={initialNearbyState} />;
}
