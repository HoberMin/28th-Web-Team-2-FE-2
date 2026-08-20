import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
  getItems: vi.fn(),
  getSelectedRegionId: vi.fn(),
}));

vi.mock("@/app/_lib/api/auth/session", () => ({
  getAccessToken: apiMocks.getAccessToken,
}));
vi.mock("@/app/_lib/api/server/items", () => ({
  getItems: apiMocks.getItems,
}));
vi.mock("@/app/_lib/api/server/selected-region", () => ({
  getSelectedRegionId: apiMocks.getSelectedRegionId,
}));

import { GET } from "./route";

const ITEM_PAGE = {
  baseDate: "2026-08-16",
  totalCount: 46,
  categoryCounts: { ROOT_VEGETABLES: 5 },
  items: [
    {
      itemId: 1,
      itemName: "감자",
      itemImageUrl: null,
      defaultUnit: "1kg",
      price: 3500,
      priceGap: null,
      priceDiffRate: null,
      isLiked: false,
    },
  ],
  page: 1,
  size: 18,
  hasNext: true,
};

describe("GET /api/items", () => {
  beforeEach(() => {
    apiMocks.getAccessToken.mockReset();
    apiMocks.getItems.mockReset();
    apiMocks.getSelectedRegionId.mockReset();
  });

  it("유효하지 않은 페이지 조건은 세션과 upstream을 읽기 전에 거부한다", async () => {
    const response = await GET(new Request("http://localhost/api/items?page=-1&size=101"));

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(apiMocks.getAccessToken).not.toHaveBeenCalled();
    expect(apiMocks.getSelectedRegionId).not.toHaveBeenCalled();
    expect(apiMocks.getItems).not.toHaveBeenCalled();
  });

  it("httpOnly 세션·지역과 검증된 다음 페이지 조건을 서버 API에 전달한다", async () => {
    apiMocks.getAccessToken.mockResolvedValue("access-token");
    apiMocks.getSelectedRegionId.mockResolvedValue("1121510100");
    apiMocks.getItems.mockResolvedValue(ITEM_PAGE);

    const response = await GET(
      new Request(
        "http://localhost/api/items?page=1&size=18&sort=PRICE_ASC&keyword=%EA%B0%90%EC%9E%90&category=ROOT_VEGETABLES",
      ),
    );

    expect(apiMocks.getItems).toHaveBeenCalledWith({
      page: 1,
      size: 18,
      sort: "PRICE_ASC",
      keyword: "감자",
      category: "ROOT_VEGETABLES",
      regionId: "1121510100",
      favoriteOnly: false,
      token: "access-token",
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual(ITEM_PAGE);
  });

  it("선택 지역이 없으면 upstream을 호출하지 않는다", async () => {
    apiMocks.getAccessToken.mockResolvedValue(undefined);
    apiMocks.getSelectedRegionId.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api/items?page=1"));

    expect(response.status).toBe(400);
    expect(apiMocks.getItems).not.toHaveBeenCalled();
  });

  it("DB가 비어 upstream이 200과 빈 목록을 주면 더미 카탈로그로 채운다", async () => {
    apiMocks.getAccessToken.mockResolvedValue(undefined);
    apiMocks.getSelectedRegionId.mockResolvedValue("1121510100");
    apiMocks.getItems.mockResolvedValue({
      baseDate: null,
      totalCount: 0,
      categoryCounts: {},
      items: [],
      page: 0,
      size: 18,
      hasNext: false,
    });

    const response = await GET(new Request("http://localhost/api/items?page=0"));

    expect(response.status).toBe(200);
    const body = (await response.json()) as { items: unknown[]; totalCount: number };
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.totalCount).toBeGreaterThan(0);
  });
});
