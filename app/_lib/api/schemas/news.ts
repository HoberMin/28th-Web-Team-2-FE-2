// GET /api/v1/news — 농산물 뉴스. 최상위 배열을 그대로 반환한다.

import { z } from "zod";

export const newsArticleSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  /** 외부 기사 원문 링크 — 그대로 `<a href>`로 나가므로 경계에서 형식을 거른다. */
  originalUrl: z.url(),
  publishedAt: z.string(),
  thumbnailUrl: z.string().optional(),
});
export type NewsArticle = z.infer<typeof newsArticleSchema>;

export const newsListSchema = z.array(newsArticleSchema);
