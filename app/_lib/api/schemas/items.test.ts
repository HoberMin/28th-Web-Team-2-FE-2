import { describe, expect, it } from "vitest";
import { itemPageSchema } from "./items";

describe("itemPageSchema", () => {
  it("기준일·가격·이미지가 없는 지역 응답을 거부하지 않는다", () => {
    const result = itemPageSchema.parse({
      baseDate: null,
      totalCount: 1,
      categoryCounts: { LEAFY_GREENS: 1 },
      items: [
        {
          itemId: 46,
          itemName: "갓",
          itemImageUrl: null,
          defaultUnit: "1kg",
          price: null,
          priceGap: null,
          priceDiffRate: null,
          isLiked: false,
        },
      ],
      page: 0,
      size: 10,
      hasNext: false,
    });

    expect(result.items[0]).toMatchObject({
      itemId: 46,
      itemName: "갓",
      price: null,
      priceGap: null,
      priceDiffRate: null,
    });
    expect(result.baseDate).toBeNull();
  });

  it("잘못된 기준일 형식은 API 경계에서 거부한다", () => {
    const result = itemPageSchema.safeParse({
      baseDate: "2026-8-16",
      totalCount: 0,
      categoryCounts: {},
      items: [],
      page: 0,
      size: 10,
      hasNext: false,
    });

    expect(result.success).toBe(false);
  });
});
