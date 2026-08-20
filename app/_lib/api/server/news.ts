import "server-only";

import { newsEnvelopeSchema, type NewsArticle } from "../schemas/news";
import { springFetch } from "../spring";
import { CACHE_TAGS } from "../tags";

/**
 * 농산물 뉴스 목록. 이 엔드포인트의 `{ code, message, data }` envelope만 여기서 벗긴다.
 * 로그인과 무관한 공개 데이터라 공유 캐시에 넣는다.
 */
export async function getNews(): Promise<NewsArticle[]> {
  const envelope = await springFetch({
    path: "/api/v1/news",
    schema: newsEnvelopeSchema,
    cache: { revalidate: 1_800, tags: [CACHE_TAGS.news] },
  });
  return envelope.data;
}
