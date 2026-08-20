import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api-error";

const { getItemsMock, getItemDetailMock } = vi.hoisted(() => ({
  getItemsMock: vi.fn(),
  getItemDetailMock: vi.fn(),
}));
vi.mock("./items", () => ({ getItems: getItemsMock, getItemDetail: getItemDetailMock }));

import {
  getItemDetailWithTemporaryFallback,
  getItemsWithTemporaryFallback,
} from "./items-fallback";

describe("getItemsWithTemporaryFallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("실제 응답에 품목이 있으면 그대로 반환한다", async () => {
    const page = {
      baseDate: "2026-08-20",
      totalCount: 1,
      categoryCounts: {},
      items: [
        {
          itemId: 9,
          itemName: "테스트",
          itemImageUrl: null,
          defaultUnit: "1kg",
          price: 1000,
          priceGap: null,
          priceDiffRate: null,
          isLiked: false,
        },
      ],
      page: 0,
      size: 18,
      hasNext: false,
    };
    getItemsMock.mockResolvedValue(page);

    const result = await getItemsWithTemporaryFallback({ regionId: "1121510100", token: undefined });

    expect(result).toEqual({ page, isTemporary: false });
  });

  it("200이지만 items가 비어 있으면 더미 카탈로그로 채운다", async () => {
    getItemsMock.mockResolvedValue({
      baseDate: null,
      totalCount: 0,
      categoryCounts: {},
      items: [],
      page: 0,
      size: 18,
      hasNext: false,
    });

    const result = await getItemsWithTemporaryFallback({ regionId: "1121510100", token: undefined });

    expect(result.isTemporary).toBe(true);
    expect(result.page.items.length).toBeGreaterThan(0);
  });

  it("일시적 업스트림 에러도 더미로 폴백한다", async () => {
    getItemsMock.mockRejectedValue(ApiError.fromStatus(502, "GET /api/v1/items"));

    const result = await getItemsWithTemporaryFallback({ regionId: "1121510100", token: undefined });

    expect(result.isTemporary).toBe(true);
    expect(result.page.items.length).toBeGreaterThan(0);
  });

  it("인증 에러는 폴백하지 않고 그대로 던진다", async () => {
    const error = ApiError.fromStatus(401, "GET /api/v1/items");
    getItemsMock.mockRejectedValue(error);

    await expect(
      getItemsWithTemporaryFallback({ regionId: "1121510100", token: "access-token" }),
    ).rejects.toBe(error);
  });
});

describe("getItemDetailWithTemporaryFallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("수치 필드가 하나라도 있으면 실응답을 그대로 반환한다", async () => {
    const detail = {
      itemId: 1,
      itemName: "감자",
      itemImageUrl: null,
      defaultUnit: "1kg",
      isLiked: false,
      latestLocalReportPrice: null,
      todayPublicPrice: 3500,
      onlineLowestPrice: null,
      baseDate: "2026-08-20",
      priceGap: null,
      priceDiffRate: null,
    };
    getItemDetailMock.mockResolvedValue(detail);

    const result = await getItemDetailWithTemporaryFallback({
      itemId: 1,
      regionId: "1121510100",
      token: undefined,
    });

    expect(result).toEqual({ detail, isTemporary: false });
  });

  it("수치 필드가 전부 null이면 더미로 채운다", async () => {
    getItemDetailMock.mockResolvedValue({
      itemId: 1,
      itemName: "감자",
      itemImageUrl: null,
      defaultUnit: "1kg",
      isLiked: false,
      latestLocalReportPrice: null,
      todayPublicPrice: null,
      onlineLowestPrice: null,
      baseDate: null,
      priceGap: null,
      priceDiffRate: null,
    });

    const result = await getItemDetailWithTemporaryFallback({
      itemId: 1,
      regionId: "1121510100",
      token: undefined,
    });

    expect(result.isTemporary).toBe(true);
    expect(result.detail.todayPublicPrice).not.toBeNull();
  });

  it("46종 임시 카탈로그를 벗어난 itemId는 빈 실응답을 그대로 둔다", async () => {
    const emptyDetail = {
      itemId: 9999,
      itemName: "알수없음",
      itemImageUrl: null,
      defaultUnit: null,
      isLiked: false,
      latestLocalReportPrice: null,
      todayPublicPrice: null,
      onlineLowestPrice: null,
      baseDate: null,
      priceGap: null,
      priceDiffRate: null,
    };
    getItemDetailMock.mockResolvedValue(emptyDetail);

    const result = await getItemDetailWithTemporaryFallback({
      itemId: 9999,
      regionId: "1121510100",
      token: undefined,
    });

    expect(result).toEqual({ detail: emptyDetail, isTemporary: false });
  });
});
