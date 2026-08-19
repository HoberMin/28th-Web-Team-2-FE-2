import { describe, expect, it } from "vitest";
import type { Item } from "@/app/_lib/api/schemas/items";
import { formatItemBaseDateLabel, mapItemToPriceView } from "./_item-view";

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
      image: "/vegetables/coupang/potato.webp",
      price: "3,500원",
      unit: "/1kg",
      trendState: "down",
      trendAmount: "500원",
      trendPercent: "(-12.5%)",
      isLiked: true,
    });
  });

  it("가격과 백엔드 이미지가 없어도 프런트 품목 사진을 사용한다", () => {
    expect(
      mapItemToPriceView({
        ...ITEM,
        itemImageUrl: null,
        price: null,
        priceGap: null,
        priceDiffRate: null,
      }),
    ).toMatchObject({
      image: "/vegetables/coupang/potato.webp",
      price: "가격 없음",
      trendState: "flat",
      trendAmount: "",
      trendPercent: "",
    });
  });

  it("백엔드 이미지 URL은 사용하지 않고 이름으로 프런트 사진을 고른다", () => {
    expect(mapItemToPriceView({ ...ITEM, itemImageUrl: "javascript:alert(1)" }).image).toBe(
      "/vegetables/coupang/potato.webp",
    );
    expect(
      mapItemToPriceView({ ...ITEM, itemImageUrl: "http://cdn.example.com/potato.png" }).image,
    ).toBe("/vegetables/coupang/potato.webp");
  });

  it("라이브 API의 고춧가루 하이픈 표기와 알 수 없는 품목을 처리한다", () => {
    expect(mapItemToPriceView({ ...ITEM, itemName: "고춧가루-국산" }).image).toBe(
      "/vegetables/coupang/pepper-powder-kr.webp",
    );
    expect(mapItemToPriceView({ ...ITEM, itemName: "새 품목" }).image).toBe(
      "/figma/design-library/images/vegetable-grid.png",
    );
  });
});

describe("formatItemBaseDateLabel", () => {
  it("기준일이 있으면 기존 날짜 표기를 사용한다", () => {
    expect(formatItemBaseDateLabel("2026-08-16")).toBe("8월 16일 기준");
  });

  // UI QA 2026-08-20 #25: "기준일 정보 없음" 대신 현재 일자를 보여준다.
  it("가격 기준일이 없으면 오늘 날짜로 표기한다", () => {
    expect(formatItemBaseDateLabel(null, new Date(2026, 7, 20))).toBe("8월 20일 기준");
  });
});
