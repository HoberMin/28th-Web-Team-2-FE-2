import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { DEFAULT_NEARBY_STORE_RADIUS } from "@/app/_lib/api/schemas/stores";
import { getNearbyStoresWithTemporaryFallback } from "@/app/_lib/api/server/stores-fallback";
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
    const { stores: result } = await getNearbyStoresWithTemporaryFallback({
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
