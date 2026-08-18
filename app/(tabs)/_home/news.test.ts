import { describe, expect, it } from "vitest";
import { ApiError } from "@/app/_lib/api/api-error";
import type { NewsArticle } from "@/app/_lib/api/schemas/news";
import { loadHomeNewsItems, mapNewsArticleToHomeItem } from "./news";

const ARTICLE: NewsArticle = {
  title: "배추 출하량 증가",
  summary: "이번 주 배추 출하량이 늘었습니다.",
  originalUrl: "https://news.example.com/articles/cabbage",
  publishedAt: "2026-08-18T10:15:00+09:00",
  thumbnailUrl: "https://images.example.com/cabbage.jpg",
};

describe("홈 뉴스 매핑", () => {
  it("뉴스 API 응답을 카드 날짜·링크·썸네일로 변환한다", () => {
    expect(mapNewsArticleToHomeItem(ARTICLE, 0)).toEqual({
      id: `news-0-${ARTICLE.originalUrl}`,
      title: ARTICLE.title,
      date: "2026.08.18",
      url: ARTICLE.originalUrl,
      thumbnailUrl: ARTICLE.thumbnailUrl,
    });
  });

  it("API가 빈 배열을 주면 뉴스 빈 상태용 배열을 반환한다", async () => {
    await expect(loadHomeNewsItems(async () => [])).resolves.toEqual([]);
  });

  it("뉴스 ApiError가 나도 다른 홈 섹션을 막지 않도록 빈 배열을 반환한다", async () => {
    const error = ApiError.fromStatus(503, "GET /api/v1/news");

    await expect(
      loadHomeNewsItems(async () => {
        throw error;
      }),
    ).resolves.toEqual([]);
  });

  it("프로그래밍 오류는 빈 상태로 숨기지 않고 다시 던진다", async () => {
    const error = new TypeError("mapper bug");

    await expect(
      loadHomeNewsItems(async () => {
        throw error;
      }),
    ).rejects.toBe(error);
  });
});
