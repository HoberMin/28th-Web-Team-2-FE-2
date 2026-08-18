import "server-only";

import {
  itemPageSchema,
  type ItemCategory,
  type ItemPage,
  type ItemSort,
} from "../schemas/items";
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
