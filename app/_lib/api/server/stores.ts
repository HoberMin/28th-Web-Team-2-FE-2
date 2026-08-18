import "server-only";

// ⚠️ **이름 충돌 주의**: `app/_lib/nearby-stores.ts`에 같은 이름의 프로토타입 더미
// (`getNearbyStores`·`NearbyStore`)가 있다. 모양이 달라서, 화면 연결 때 에디터 자동 import가
// 더미를 집어오면 **조용히 가짜 데이터가 화면에 뜬다.** import 경로를 눈으로 확인할 것.
// 더미를 걷어내는 시점에 이 주석도 지운다.

import { nearbyStoresEnvelopeSchema, type NearbyStores } from "../schemas/stores";
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
export async function getNearbyStores({
  token,
  ...query
}: GetNearbyStoresParams): Promise<NearbyStores> {
  const envelope = await springFetch({
    path: "/api/v1/stores/nearby",
    query: { ...query },
    token,
    schema: nearbyStoresEnvelopeSchema,
    cache: token ? "no-store" : { revalidate: 300, tags: [CACHE_TAGS.stores] },
  });
  return envelope.data;
}
