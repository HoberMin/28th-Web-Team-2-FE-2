import { beforeEach, describe, expect, it, vi } from "vitest";

const { getRegionLowestPricesMock } = vi.hoisted(() => ({ getRegionLowestPricesMock: vi.fn() }));
vi.mock("./reports", () => ({ getRegionLowestPrices: getRegionLowestPricesMock }));

import { getRegionLowestPricesWithTemporaryFallback } from "./reports-fallback";

describe("getRegionLowestPricesWithTemporaryFallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("200이지만 items가 비어 있으면 더미로 채운다", async () => {
    getRegionLowestPricesMock.mockResolvedValue({ regionName: null, items: [] });

    const { prices, isTemporary } = await getRegionLowestPricesWithTemporaryFallback({
      regionId: "1121510100",
      limit: 10,
    });

    expect(isTemporary).toBe(true);
    expect(prices.items.length).toBeGreaterThan(0);
  });

  // 생강처럼 전용 벡터 아이콘이 없는 품목은 홈 화면에서 다른 채소 아이콘으로 대체돼
  // 눈에 띄게 어긋나 보인다(사용자 신고) — 더미가 전용 아이콘 있는 품목만 고르는지 확인.
  it("더미 목록에 전용 아이콘 없는 품목(생강)이 없다", async () => {
    getRegionLowestPricesMock.mockResolvedValue({ regionName: null, items: [] });

    const { prices } = await getRegionLowestPricesWithTemporaryFallback({
      regionId: "1121510100",
      limit: 10,
    });

    for (const item of prices.items) {
      expect(item.itemName).not.toBe("생강");
    }
  });
});
