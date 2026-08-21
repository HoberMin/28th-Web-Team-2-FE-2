import "server-only";

import {
  itemDetailSchema,
  itemPageEnvelopeSchema,
  type ItemCategory,
  type ItemDetail,
  type ItemPage,
  type ItemSort,
} from "../schemas/items";
import {
  onlinePricesSchema,
  publicPriceTrendSchema,
  type OnlinePrices,
  type PublicPricePeriod,
  type PublicPriceTrend,
} from "../schemas/item-prices";
import { springFetch } from "../spring";
import { CACHE_TAGS } from "../tags";

export interface GetItemsParams {
  /** 법정동 코드. 앞자리 0이 있을 수 있어 문자열이다. */
  regionId: string;
  page?: number;
  size?: number;
  sort?: ItemSort;
  keyword?: string;
  category?: ItemCategory;
  favoriteOnly?: boolean;
  /**
   * 로그인 상태면 넘긴다. **키는 필수다** — 빠뜨려서 익명 호출이 되는 걸 막기 위해
   * 호출부가 매번 "이 요청은 익명인가"를 명시하게 한다(`undefined`를 직접 적어야 한다).
   */
  token: string | undefined;
}

/**
 * 품목 목록 + 공공가격.
 *
 * ⚠️ 캐싱이 토큰 유무로 갈린다. 응답의 `isLiked`가 사용자마다 다르기 때문에
 * **로그인 상태의 응답을 공유 캐시에 넣으면 남의 찜 상태가 보인다.**
 * 스펙에 `security` 선언이 없어서 공개 API처럼 보이지만 실제로는 개인화 응답이다
 * (`backend-api-reference` §2).
 *
 * TODO(✍️): 비회원이 어디까지 쓸 수 있는지 BE 확인 대기 중
 * (`농산물-문서/be-요청사항.md` 3번). 답에 따라 비로그인 캐시 시간을 조정한다.
 */
export async function getItems({ token, ...query }: GetItemsParams): Promise<ItemPage> {
  const envelope = await springFetch({
    path: "/api/v1/items",
    query: { ...query },
    token,
    schema: itemPageEnvelopeSchema,
    cache: token ? "no-store" : { revalidate: 300, tags: [CACHE_TAGS.items] },
  });
  return envelope.data;
}

export interface GetItemDetailParams {
  itemId: number;
  regionId: string;
  token: string | undefined;
}

/**
 * 품목 상세 — 요약 카드용 수치(오늘 공공시세·어제 대비·최근 동네 제보가·온라인 최저가·찜 여부).
 *
 * `isLiked`가 있어 items 목록과 같은 이유로 로그인 상태는 캐시하지 않는다.
 */
export function getItemDetail({ token, ...query }: GetItemDetailParams): Promise<ItemDetail> {
  const { itemId, ...rest } = query;
  return springFetch({
    path: `/api/v1/items/${itemId}`,
    query: { ...rest },
    token,
    schema: itemDetailSchema,
    cache: token ? "no-store" : { revalidate: 300, tags: [CACHE_TAGS.items] },
  });
}

/**
 * 품목 찜 추가/해제. 204를 주므로 본문이 없다.
 *
 * **여기서 `revalidateTag`를 부르지 않는다.** 찜 상태가 담긴 응답(`token` 있음)은 애초에
 * `no-store`라 캐시에 없고, 태그가 붙은 건 비로그인용 공유 캐시뿐인데 거기엔 찜 정보가 없다.
 * 무효화하면 **로그인 사용자가 하트를 누를 때마다 전 게스트 캐시가 날아가** `revalidate: 300`이
 * 무력화된다. 화면 갱신은 호출한 Server Action이 `revalidatePath`나 낙관적 업데이트로 처리한다.
 */
export async function setItemFavorite(params: {
  itemId: number;
  liked: boolean;
  token: string;
}): Promise<void> {
  await springFetch({
    path: `/api/v1/items/${params.itemId}/favorite`,
    method: params.liked ? "PUT" : "DELETE",
    token: params.token,
    cache: "no-store",
  });
}

export interface GetPublicPriceTrendParams {
  itemId: number;
  regionId: string;
  period?: PublicPricePeriod;
}

/**
 * 기간별 공공가격 추이 — 시세 상세의 주간 가격 그래프.
 *
 * 개인화 필드가 없어 토큰을 받지 않는다. 공공가격은 하루 단위로 갱신되므로 길게 캐시한다.
 * 적재 전이면 `points: []`로 정상 200이 온다(에러가 아니다) — 폴백은 `items-fallback`이 판단한다.
 */
export function getPublicPriceTrend({
  itemId,
  ...query
}: GetPublicPriceTrendParams): Promise<PublicPriceTrend> {
  return springFetch({
    path: `/api/v1/items/${itemId}/public-prices`,
    query: { ...query },
    schema: publicPriceTrendSchema,
    cache: { revalidate: 3_600, tags: [CACHE_TAGS.items] },
  });
}

/**
 * 채널별 온라인 최저가 — 시세 상세의 쇼핑몰 비교.
 *
 * `regionId`를 받지 않는다(전국 공통). 수집 전이면 `onlinePrices: []`로 정상 200이 온다.
 */
export function getOnlinePrices(itemId: number): Promise<OnlinePrices> {
  return springFetch({
    path: `/api/v1/items/${itemId}/online-prices`,
    schema: onlinePricesSchema,
    cache: { revalidate: 3_600, tags: [CACHE_TAGS.items] },
  });
}
