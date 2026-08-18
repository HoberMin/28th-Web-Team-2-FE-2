import { describe, expect, it } from "vitest";
import type { Item } from "@/app/_lib/api/schemas/items";
import { mapItemToPriceView } from "./_item-view";

const ITEM: Item = {
  itemId: 1,
  itemName: "감자",
  itemImageUrl: "https://cdn.example.com/potato.png",
  defaultUnit: "1kg",
  price: 3500,
  priceGap: -500,
  priceDiffRate: -12.5,
  isLiked: true,
};

describe("mapItemToPriceView", () => {
  it("API 숫자 ID와 가격 변동을 화면 표시값으로 옮긴다", () => {
    expect(mapItemToPriceView(ITEM)).toEqual({
      itemId: 1,
      name: "감자",
      image: "https://cdn.example.com/potato.png",
      price: "3,500원",
      unit: "/1kg",
      trendState: "down",
      trendAmount: "500원",
      trendPercent: "(-12.5%)",
      isLiked: true,
    });
  });

  it("가격과 이미지가 없으면 안전한 표시값을 사용한다", () => {
    expect(
      mapItemToPriceView({
        ...ITEM,
        itemImageUrl: null,
        price: null,
        priceGap: null,
        priceDiffRate: null,
      }),
    ).toMatchObject({
      image: "/figma/design-library/images/vegetable-grid.png",
      price: "가격 없음",
      trendState: "flat",
      trendAmount: "",
      trendPercent: "",
    });
  });

  it("잘못된 이미지 URL 한 건을 공용 대체 이미지로 격리한다", () => {
    expect(mapItemToPriceView({ ...ITEM, itemImageUrl: "javascript:alert(1)" }).image).toBe(
      "/figma/design-library/images/vegetable-grid.png",
    );
    expect(
      mapItemToPriceView({ ...ITEM, itemImageUrl: "http://cdn.example.com/potato.png" }).image,
    ).toBe("/figma/design-library/images/vegetable-grid.png");
  });
});
