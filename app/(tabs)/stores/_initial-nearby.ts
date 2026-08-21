import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { DEFAULT_NEARBY_STORE_RADIUS } from "@/app/_lib/api/schemas/stores";
import { getNearbyStores } from "@/app/_lib/api/server/stores";
import { mapNearbyStoreToMapStore, type MapCenter } from "./_data";
import { createNearbyStoresRequestKey, type NearbyStoresState } from "./_nearby-state";

export async function loadInitialNearbyStores(center: MapCenter): Promise<NearbyStoresState> {
  const token = await getAccessToken();
  const request = {
    center,
    radius: DEFAULT_NEARBY_STORE_RADIUS,
    keyword: "",
    onlyLiked: false,
  };
  const key = createNearbyStoresRequestKey(request);

  try {
    // ⚠️ `getNearbyStoresWithTemporaryFallback`을 쓰지 않는다 — `app/api/stores/nearby/route.ts`와
    // 같은 이유(더미 storeId가 실제 storeId와 겹쳐 클릭하면 엉뚱한 가게로 이동한다,
    // 2026-08-21 버그 리포트). 진짜 빈 결과는 `_map-view.tsx`의 빈 상태가 처리하고,
    // 진짜 실패는 아래 catch가 "error" 상태로 넘긴다.
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
