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
  /**
   * 로그인 상태면 넘긴다. **키는 필수다** — 빠뜨려서 익명 호출이 되는 걸 막기 위해
   * 호출부가 매번 "이 요청은 익명인가"를 명시하게 한다(`undefined`를 직접 적어야 한다).
   */
  token: string | undefined;
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
