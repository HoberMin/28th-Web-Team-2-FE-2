import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api-error";
import { DEDICATED_VEGETABLE_ICON_IDS } from "../../vegetable-images";

const { getNearbyStoresMock, getStoreReportsMock, getRecommendedStoresMock } = vi.hoisted(() => ({
  getNearbyStoresMock: vi.fn(),
  getStoreReportsMock: vi.fn(),
  getRecommendedStoresMock: vi.fn(),
}));
vi.mock("./stores", () => ({
  getNearbyStores: getNearbyStoresMock,
  getFavoriteStores: vi.fn(),
  getStoreReports: getStoreReportsMock,
  getRecommendedStores: getRecommendedStoresMock,
}));

import {
  getNearbyStoresWithTemporaryFallback,
  getRecommendedStoresWithTemporaryFallback,
  getStoreReportsWithTemporaryFallback,
} from "./stores-fallback";

describe("getNearbyStoresWithTemporaryFallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("실제 응답에 가게가 있으면 그대로 반환한다", async () => {
    const stores = {
      totalCount: 1,
      stores: [
        { storeId: 1, storeName: "장보고 마트", latitude: 37.5, longitude: 127.05, isLiked: false },
      ],
    };
    getNearbyStoresMock.mockResolvedValue(stores);

    const result = await getNearbyStoresWithTemporaryFallback({
      latitude: 37.5,
      longitude: 127.05,
      token: undefined,
    });

    expect(result).toEqual({ stores, isTemporary: false });
  });

  it("200이지만 stores가 비어 있으면 더미로 채우고 요청 좌표 주변에 흩뿌린다", async () => {
    getNearbyStoresMock.mockResolvedValue({ totalCount: 0, stores: [] });

    const result = await getNearbyStoresWithTemporaryFallback({
      latitude: 37.5,
      longitude: 127.05,
      radius: 500,
      token: undefined,
    });

    expect(result.isTemporary).toBe(true);
    expect(result.stores.stores.length).toBeGreaterThan(0);
    for (const store of result.stores.stores) {
      expect(Math.abs(store.latitude - 37.5)).toBeLessThan(0.02);
      expect(Math.abs(store.longitude - 127.05)).toBeLessThan(0.02);
    }
    // 흩어져야 한다 — 전부 같은 점이면 지도에서 구분이 안 된다.
    const uniqueCoords = new Set(result.stores.stores.map((store) => `${store.latitude},${store.longitude}`));
    expect(uniqueCoords.size).toBeGreaterThan(1);
  });

  it("일시적 업스트림 에러도 더미로 폴백한다", async () => {
    getNearbyStoresMock.mockRejectedValue(ApiError.fromStatus(502, "GET /api/v1/stores/nearby"));

    const result = await getNearbyStoresWithTemporaryFallback({
      latitude: 37.5,
      longitude: 127.05,
      token: undefined,
    });

    expect(result.isTemporary).toBe(true);
    expect(result.stores.stores.length).toBeGreaterThan(0);
  });

  it("인증 에러는 폴백하지 않고 그대로 던진다", async () => {
    const error = ApiError.fromStatus(401, "GET /api/v1/stores/nearby");
    getNearbyStoresMock.mockRejectedValue(error);

    await expect(
      getNearbyStoresWithTemporaryFallback({
        latitude: 37.5,
        longitude: 127.05,
        token: "access-token",
      }),
    ).rejects.toBe(error);
  });
});

describe("더미 품목은 전용 벡터 아이콘이 있는 품목만 쓴다", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 생강처럼 전용 SVG가 없는 품목은 홈 화면에서 당근 등 다른 벡터로 대체돼 눈에 띄게
  // 어긋나 보인다(사용자 신고). 더미 생성기가 전용 아이콘이 있는 품목만 고르는지 검증한다.

  it("가게 상세 더미 제보 목록에 전용 아이콘 없는 품목(생강)이 없다", async () => {
    getStoreReportsMock.mockResolvedValue({ storeId: 1, summary: { cheapCount: 0, expensiveCount: 0 }, reports: [], page: 0, size: 0, hasNext: false });

    const { reports } = await getStoreReportsWithTemporaryFallback({
      storeId: 1,
      token: undefined,
    });

    expect(reports.reports.length).toBeGreaterThan(0);
    for (const report of reports.reports) {
      expect(report.itemName).not.toBe("생강");
    }
  });

  it("추천 가게 더미의 대표 저렴 상품에 전용 아이콘 없는 품목(생강)이 없다", async () => {
    getRecommendedStoresMock.mockResolvedValue({ totalCount: 0, stores: [] });

    const { stores } = await getRecommendedStoresWithTemporaryFallback({
      regionId: "1121510100",
      token: undefined,
    });

    expect(stores.stores.length).toBeGreaterThan(0);
    for (const store of stores.stores) {
      expect(store.cheapItems).not.toContain("생강");
    }
    // 정합성 확인: 전용 아이콘 목록이 실제로 10종이다(회귀 방지).
    expect(DEDICATED_VEGETABLE_ICON_IDS).toHaveLength(10);
  });
});
