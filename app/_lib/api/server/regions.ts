import "server-only";

import {
  nearbyRegionsSchema,
  regionSearchEnvelopeSchema,
  type Region,
} from "../schemas/regions";
import { springFetch } from "../spring";
import { CACHE_TAGS } from "../tags";

/**
 * 동 이름으로 법정동 검색.
 *
 * ⚠️ 이 엔드포인트만 `{code, message, data}`로 감싸 오므로 여기서 벗겨서 돌려준다.
 * 공통 unwrap 유틸을 만들지 않는 이유는 다른 엔드포인트가 감싸지 않기 때문이다.
 *
 * ⚠️ 쿼리 파라미터가 스펙에는 `request`로 나오지만 실제 키는 `keyword`다
 * (springdoc의 POJO 바인딩 표기 — `backend-api-reference` §2).
 */
export async function searchRegions(keyword: string): Promise<Region[]> {
  const envelope = await springFetch({
    path: "/api/v1/regions/search",
    query: { keyword },
    schema: regionSearchEnvelopeSchema,
    // 법정동은 거의 안 바뀌고 사용자와 무관한 공개 데이터라 길게 잡는다.
    cache: { revalidate: 86_400, tags: [CACHE_TAGS.regions] },
  });
  return envelope.data.searchResults;
}

/**
 * 좌표로 법정동 조회. 최상위 배열을 그대로 준다(envelope 없음).
 *
 * ⚠️ 여기 `regionId`는 스펙상 int64라 앞자리 0이 이미 사라진 채 온다.
 * 스키마에서 문자열로 바꾸지만, **원본에서 유실된 0은 복구할 수 없다** — BE에 통일을 요청해 뒀다.
 */
export function getNearbyRegions(params: {
  latitude: number;
  longitude: number;
}): Promise<Region[]> {
  return springFetch({
    path: "/api/v1/regions/nearby",
    query: { ...params },
    schema: nearbyRegionsSchema,
    // 좌표별로 결과가 갈리지만 사용자와 무관하고 잘 안 바뀐다.
    cache: { revalidate: 3_600, tags: [CACHE_TAGS.regions] },
  });
}
