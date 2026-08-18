import "server-only";

import { newsListSchema, type NewsArticle } from "../schemas/news";
import { springFetch } from "../spring";
import { CACHE_TAGS } from "../tags";

/**
 * 농산물 뉴스 목록. 최상위 배열을 그대로 반환한다(envelope 없음).
 * 로그인과 무관한 공개 데이터라 공유 캐시에 넣는다.
 */
export function getNews(): Promise<NewsArticle[]> {
  return springFetch({
    path: "/api/v1/news",
    schema: newsListSchema,
    cache: { revalidate: 1_800, tags: [CACHE_TAGS.news] },
  });
}
