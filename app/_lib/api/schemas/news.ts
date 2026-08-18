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

/**
 * 뉴스 목록.
 *
 * **항목 단위로 거른다** — 배열 전체를 한 스키마로 검증하면 기사 하나의 URL이 깨졌을 때
 * `ApiError.parse`가 터져 **홈의 뉴스 섹션이 통째로 사라진다.** BE가 외부에서 수집해 오는
 * 값이라 한 건이 깨질 확률이 낮지 않다. 못 읽은 항목만 버리고 나머지는 보여준다.
 */
export const newsListSchema = z
  .array(z.unknown())
  .transform((items) =>
    items.flatMap((item) => {
      const parsed = newsArticleSchema.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    }),
  );
