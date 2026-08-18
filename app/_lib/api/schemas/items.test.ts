import { describe, expect, it } from "vitest";
import { itemPageSchema } from "./items";

describe("itemPageSchema", () => {
  it("가격과 이미지가 없는 계절 품목 때문에 전체 응답을 거부하지 않는다", () => {
    const result = itemPageSchema.parse({
      baseDate: "2026-08-16",
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
  });
});
