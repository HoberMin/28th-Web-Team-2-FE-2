import { describe, expect, it } from "vitest";
import { mapRegionLowestPriceToView } from "./home-view";
import type { RegionLowestPriceItem } from "@/app/_lib/api/schemas/reports";

function item(overrides: Partial<RegionLowestPriceItem> = {}): RegionLowestPriceItem {
  return {
    rank: 1,
    reportId: 1,
    itemId: 1,
    itemName: "감자",
    itemImageUrl: null,
    storeId: null,
    storeName: "동네마트",
    price: 920,
    unit: "1kg",
    priceDiffRate: null,
    ...overrides,
  };
}

describe("mapRegionLowestPriceToView", () => {
  it("price와 priceDiffRate로 등락 금액(원)을 역산한다", () => {
    // publicPrice 1000원 대비 10% 저렴 → price 900원. 차액은 100원이어야 한다.
    const view = mapRegionLowestPriceToView(item({ price: 900, priceDiffRate: -10 }));

    expect(view.trend).toBe("down");
    expect(view.trendAmount).toBe("100원");
    expect(view.trendRate).toBe(10);
  });

  it("상승(양수 rate)도 금액 크기(부호 없음)로 낸다", () => {
    // publicPrice 1000원 대비 10% 비쌈 → price 1100원. 차액은 100원.
    const view = mapRegionLowestPriceToView(item({ price: 1100, priceDiffRate: 10 }));

    expect(view.trend).toBe("up");
    expect(view.trendAmount).toBe("100원");
    expect(view.trendRate).toBe(10);
  });

  it("rate가 없거나 0이면 등락 금액을 비운다", () => {
    expect(mapRegionLowestPriceToView(item({ priceDiffRate: null })).trendAmount).toBe("");
    expect(mapRegionLowestPriceToView(item({ priceDiffRate: 0 })).trendAmount).toBe("");
  });

  it("rate가 -100%에 가까우면(공공가 0원 근접) 나눗셈이 불안정해 비운다", () => {
    const view = mapRegionLowestPriceToView(item({ price: 100, priceDiffRate: -99.9 }));
    expect(view.trendAmount).toBe("");
  });
});
