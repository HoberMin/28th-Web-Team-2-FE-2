import "server-only";

import { revalidateTag } from "next/cache";
import {
  itemPageSchema,
  type ItemCategory,
  type ItemPage,
  type ItemSort,
} from "../schemas/items";
import { springFetch } from "../spring";
import { CACHE_TAGS, REVALIDATE_IMMEDIATELY } from "../tags";

export interface GetItemsParams {
  /** 법정동 코드. 앞자리 0이 있을 수 있어 문자열이다. */
  regionId: string;
  page?: number;
  size?: number;
  sort?: ItemSort;
  keyword?: string;
  category?: ItemCategory;
  favoriteOnly?: boolean;
  /** 로그인 상태면 넘긴다. 넘기는 순간 응답이 개인화되어 캐시하지 않는다. */
  token?: string;
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
export function getItems({ token, ...query }: GetItemsParams): Promise<ItemPage> {
  return springFetch({
    path: "/api/v1/items",
    query: { ...query },
    token,
    schema: itemPageSchema,
    cache: token ? "no-store" : { revalidate: 300, tags: [CACHE_TAGS.items] },
  });
}

/**
 * 품목 찜 추가/해제. 204를 주므로 본문이 없다.
 *
 * **Server Action이나 Route Handler에서만 호출한다** — 내부에서 `revalidateTag`를 부르는데
 * 렌더 도중에는 호출할 수 없다.
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
  revalidateTag(CACHE_TAGS.items, REVALIDATE_IMMEDIATELY);
}
