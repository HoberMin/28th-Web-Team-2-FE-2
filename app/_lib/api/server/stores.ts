import "server-only";

import { nearbyStoresSchema, type NearbyStores } from "../schemas/stores";
import { springFetch } from "../spring";
import { CACHE_TAGS } from "../tags";

export interface GetNearbyStoresParams {
  latitude: number;
  longitude: number;
  /** 미터. 최대 5000. */
  radius?: number;
  onlyLiked?: boolean;
  keyword?: string;
  token?: string;
}

/**
 * 지도 중심 주변 가게.
 *
 * `getItems`와 같은 이유로 로그인 상태에서는 캐시하지 않는다 — 응답의 `isLiked`가
 * 사용자별로 다르다.
 */
export function getNearbyStores({
  token,
  ...query
}: GetNearbyStoresParams): Promise<NearbyStores> {
  return springFetch({
    path: "/api/v1/stores/nearby",
    query: { ...query },
    token,
    schema: nearbyStoresSchema,
    cache: token ? "no-store" : { revalidate: 300, tags: [CACHE_TAGS.stores] },
  });
}
