// GET /api/v1/news — 농산물 뉴스. 최상위 배열을 그대로 반환한다.

import { z } from "zod";

export const newsArticleSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  /** 외부 기사 원문 링크 — 뉴스 카드는 이 주소로 나간다. */
  originalUrl: z.string(),
  publishedAt: z.string(),
  thumbnailUrl: z.string().optional(),
});
export type NewsArticle = z.infer<typeof newsArticleSchema>;

export const newsListSchema = z.array(newsArticleSchema);
