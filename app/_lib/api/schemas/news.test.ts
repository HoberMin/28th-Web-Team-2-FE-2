import { describe, expect, it } from "vitest";
import { newsEnvelopeSchema } from "./news";

const VALID_ARTICLE = {
  title: "양파 가격 동향",
  summary: "산지 출하량이 늘었습니다.",
  originalUrl: "https://news.example.com/articles/onion",
  publishedAt: "2026-08-18T09:30:00+09:00",
  thumbnailUrl: "https://images.example.com/onion.jpg",
};

describe("newsEnvelopeSchema", () => {
  it("원문 URL이 안전하지 않은 기사만 격리한다", () => {
    const parsed = newsEnvelopeSchema.parse({
      code: "SUCCESS",
      message: "성공",
      data: [
        VALID_ARTICLE,
        {
          ...VALID_ARTICLE,
          title: "잘못된 기사",
          originalUrl: "javascript:alert(1)",
        },
      ],
    });

    expect(parsed.data).toHaveLength(1);
    expect(parsed.data[0]?.title).toBe(VALID_ARTICLE.title);
  });

  it("썸네일 URL이 잘못돼도 기사는 유지하고 이미지만 생략한다", () => {
    const parsed = newsEnvelopeSchema.parse({
      data: [
        {
          ...VALID_ARTICLE,
          thumbnailUrl: "not-a-url",
        },
      ],
    });

    expect(parsed.data).toHaveLength(1);
    expect(parsed.data[0]?.thumbnailUrl).toBeUndefined();
  });
});
