// GET /api/v1/news — 농산물 뉴스. 최상위 배열을 그대로 반환한다.

import { z } from "zod";

export const newsArticleSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  /**
   * 외부 기사 원문 링크 — 그대로 `<a href>`로 나간다.
   * **스킴을 http(s)로 제한한다**: `z.url()`은 `new URL()` 파싱만 해서
   * `javascript:alert(1)`·`data:text/html,...`을 통과시킨다. BE가 외부에서 수집해 오는
   * 값이라 신뢰 경계 밖이고, 화면에 붙는 순간 클릭 XSS가 된다.
   */
  originalUrl: z.url({ protocol: /^https?$/ }),
  publishedAt: z.string(),
  thumbnailUrl: z.string().optional(),
});
export type NewsArticle = z.infer<typeof newsArticleSchema>;

export const newsListSchema = z.array(newsArticleSchema);
