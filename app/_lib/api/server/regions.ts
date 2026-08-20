import "server-only";

// ⚠️ **이름 충돌 주의**: `app/_lib/regions.ts`에 같은 이름의 프로토타입 더미
// (`searchRegions`·`Region`)가 있다. 화면 연결 때 자동 import가 더미를 집어오지 않도록
// import 경로를 눈으로 확인할 것. 더미를 걷어내는 시점에 이 주석도 지운다.

import {
  nearbyRegionsSchema,
  regionSearchEnvelopeSchema,
  userRegionsResponseSchema,
  type Region,
  type UserRegion,
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
 * 스키마가 10자리로 `padStart`해 복원한다(자릿수 고정 가정 — BE 확인 대기).
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

/**
 * 로그인 사용자의 관심 지역 목록 (현재 선택 여부 포함).
 *
 * 사용자별 응답이라 `no-store`다(`auth-session` §5) — 공유 캐시에 넣으면 남의 관심 지역이 보인다.
 */
export async function getUserRegions(token: string): Promise<UserRegion[]> {
  const { regions } = await springFetch({
    path: "/api/v1/users/me/regions",
    token,
    schema: userRegionsResponseSchema,
    cache: "no-store",
  });
  return regions;
}

/** 관심 지역 추가. 204라 본문이 없다. 실패(`ApiError.kind`): `conflict`(409, 중복·최대 개수 초과)·`badRequest`(400). */
export async function addUserRegion(params: { regionId: string; token: string }): Promise<void> {
  await springFetch({
    path: "/api/v1/users/me/regions",
    method: "POST",
    body: { regionId: params.regionId },
    token: params.token,
    cache: "no-store",
  });
}

/** 현재 관심 지역 전환. 204라 본문이 없다. */
export async function setCurrentUserRegion(params: {
  regionId: string;
  token: string;
}): Promise<void> {
  await springFetch({
    path: `/api/v1/users/me/regions/${params.regionId}/current`,
    method: "PUT",
    token: params.token,
    cache: "no-store",
  });
}

/**
 * 프론트 선택 지역(쿠키)과 Spring 계정의 현재 관심 지역을 맞춘다.
 *
 * 제보처럼 regionId가 계정 데이터에도 반영되어야 하는 쓰기 흐름 직전에서 쓴다.
 * 이미 현재 지역이면 GET 한 번으로 끝나고, 등록되지 않은 지역만 추가한다.
 */
export async function ensureCurrentUserRegion(params: {
  regionId: string;
  token: string;
}): Promise<void> {
  const regions = await getUserRegions(params.token);
  const selected = regions.find((region) => region.regionId === params.regionId);

  if (!selected) {
    await addUserRegion(params);
  }
  if (!selected?.isCurrent) {
    await setCurrentUserRegion(params);
  }
}
