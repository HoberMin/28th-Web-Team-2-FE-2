import "server-only";

import { FIXED_REGION_ID } from "../fixed-region";

// ⚠️ **이름 충돌 주의**: `app/_lib/nearby-stores.ts`에 같은 이름의 프로토타입 더미
// (`getNearbyStores`·`NearbyStore`)가 있다. 모양이 달라서, 화면 연결 때 에디터 자동 import가
// 더미를 집어오면 **조용히 가짜 데이터가 화면에 뜬다.** import 경로를 눈으로 확인할 것.
// 더미를 걷어내는 시점에 이 주석도 지운다.

import {
  favoriteStoresEnvelopeSchema,
  nearbyStoresEnvelopeSchema,
  storeRecommendationEnvelopeSchema,
  storeDetailEnvelopeSchema,
  storeReportsEnvelopeSchema,
  type FavoriteStores,
  type NearbyStores,
  type StoreDetail,
  type StoreRecommendation,
  type StoreReportFilter,
  type StoreReports,
} from "../schemas/stores";
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

/**
 * 가게 단골 등록/해제. 204라 본문이 없다.
 *
 * `setItemFavorite`과 같은 이유로 **`revalidateTag`를 부르지 않는다** — 단골 여부가 담긴
 * 응답(`token` 있음)은 애초에 `no-store`고, 태그가 붙은 공유 캐시에는 개인화 정보가 없다.
 * 하트를 누를 때마다 전 게스트 캐시를 날리면 `revalidate: 300`이 무력해진다.
 * 화면 갱신은 호출한 Server Action이 `revalidatePath`로 처리한다.
 */
export async function setStoreFavorite(params: {
  storeId: number;
  liked: boolean;
  token: string;
}): Promise<void> {
  await springFetch({
    path: `/api/v1/stores/${params.storeId}/favorite`,
    method: params.liked ? "PUT" : "DELETE",
    token: params.token,
    cache: "no-store",
  });
}

/**
 * 내 단골 가게 목록 (F04 찜 「가게」 탭 · F05 마이페이지).
 *
 * 로그인 전용이라 토큰이 필수고, 응답 전체가 개인화라 `no-store`다.
 * 좌표를 넘기면 `distanceMeters`가 채워진다 — 없으면 거리 자리를 비워 그린다.
 */
export async function getFavoriteStores(params: {
  token: string;
  latitude?: number;
  longitude?: number;
  page?: number;
  size?: number;
}): Promise<FavoriteStores> {
  const { token, ...query } = params;
  const envelope = await springFetch({
    path: "/api/v1/users/me/favorite-stores",
    query: { ...query },
    token,
    schema: favoriteStoresEnvelopeSchema,
    cache: "no-store",
  });
  return envelope.data;
}

/**
 * 가게별 가격 제보 (F03-3 가게 상세의 「저렴해요」·「비싸요」).
 *
 * 응답에 개인화 필드가 없어 비로그인도 같은 값을 받는다 — 토큰이 없을 때만 공유 캐시를 쓴다.
 * 제보가 새로 들어오면 `createReport`가 `stores` 태그를 즉시 무효화한다.
 */
export async function getStoreReports(params: {
  storeId: number;
  filter?: StoreReportFilter;
  page?: number;
  size?: number;
  token: string | undefined;
}): Promise<StoreReports> {
  const { storeId, token, ...query } = params;
  const envelope = await springFetch({
    path: `/api/v1/stores/${storeId}/reports`,
    query: { ...query },
    token,
    schema: storeReportsEnvelopeSchema,
    cache: token ? "no-store" : { revalidate: 300, tags: [CACHE_TAGS.stores] },
  });
  return envelope.data;
}

/**
 * 제보 가격이 저렴한 주변 가게 (F01 홈 추천 카드).
 *
 * `regionId`는 법정동 코드라 **앞자리 0이 유실되면 안 된다** — 끝까지 문자열로 다룬다.
 */
export async function getRecommendedStores(params: {
  regionId: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  token: string | undefined;
}): Promise<StoreRecommendation> {
  const { token, ...query } = params;
  const envelope = await springFetch({
    path: "/api/v1/stores/recommendation",
    query: { ...query, regionId: FIXED_REGION_ID },
    token,
    schema: storeRecommendationEnvelopeSchema,
    cache: token ? "no-store" : { revalidate: 300, tags: [CACHE_TAGS.stores] },
  });
  return envelope.data;
}

export interface GetStoreDetailParams {
  storeId: number;
  /** 넘기면 응답에 거리·도보시간이 채워진다. 없으면 그 두 필드가 null이다. */
  latitude?: number;
  longitude?: number;
  /** 로그인 상태면 넘긴다. **키는 필수** — 익명 호출을 실수로 하는 걸 막는다. */
  token: string | undefined;
}

/**
 * 가게 상세.
 *
 * ⚠️ `isLiked`(단골 여부)가 개인화 필드라 **로그인 상태의 응답은 공유 캐시에 넣지 않는다**
 * (`auth-session` §5). 스펙에 `security` 선언이 없어 공개 API처럼 보이지만 개인화 응답이다.
 */
export async function getStoreDetail({
  storeId,
  token,
  ...query
}: GetStoreDetailParams): Promise<StoreDetail> {
  const envelope = await springFetch({
    path: `/api/v1/stores/${storeId}`,
    query: { ...query },
    token,
    schema: storeDetailEnvelopeSchema,
    cache: token ? "no-store" : { revalidate: 300, tags: [CACHE_TAGS.stores] },
  });
  return envelope.data;
}
