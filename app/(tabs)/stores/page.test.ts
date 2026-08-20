import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/app/_lib/api/api-error";

const { getAccessTokenMock, getNearbyStoresMock, getVerifiedSelectedRegionMock } = vi.hoisted(
  () => ({
    getAccessTokenMock: vi.fn(),
    getNearbyStoresMock: vi.fn(),
    getVerifiedSelectedRegionMock: vi.fn(),
  }),
);

vi.mock("@/app/_lib/api/auth/session", () => ({ getAccessToken: getAccessTokenMock }));
vi.mock("@/app/_lib/api/server/stores", () => ({ getNearbyStores: getNearbyStoresMock }));
vi.mock("@/app/_lib/api/server/selected-region", () => ({
  getVerifiedSelectedRegion: getVerifiedSelectedRegionMock,
}));
vi.mock("./_map-view", () => ({ StoresMapView: () => null }));

import StoresPage from "./page";
import { loadInitialNearbyStores } from "./_initial-nearby";

const seongseongCenter = { lat: 36.8358, lng: 127.1324 };

describe("loadInitialNearbyStores", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAccessTokenMock.mockResolvedValue("access-token");
  });

  it("선택한 동네 중심을 httpOnly 토큰과 함께 서버에서 조회한다", async () => {
    getNearbyStoresMock.mockResolvedValue({
      totalCount: 1,
      stores: [
        {
          storeId: 101,
          storeName: "장보고 마트",
          latitude: seongseongCenter.lat,
          longitude: seongseongCenter.lng,
          isLiked: true,
        },
      ],
    });

    await expect(loadInitialNearbyStores(seongseongCenter)).resolves.toMatchObject({
      key: "36.8358|127.1324|500||false",
      status: "success",
      stores: [{ id: "101", name: "장보고 마트", isLiked: true }],
    });
    expect(getNearbyStoresMock).toHaveBeenCalledWith({
      latitude: seongseongCenter.lat,
      longitude: seongseongCenter.lng,
      radius: 500,
      onlyLiked: false,
      token: "access-token",
    });
  });

  it("live backend 502는 화면 유지용 임시 더미 가게로 폴백한다", async () => {
    // DB에 실데이터가 없는 동안 화면 구조를 테스트할 수 있도록 `getNearbyStoresWithTemporaryFallback`이
    // 업스트림 에러를 삼키고 더미로 채운다(`stores-fallback.ts`) — 더 이상 에러 상태로 격리하지 않는다.
    getNearbyStoresMock.mockRejectedValue(
      ApiError.fromStatus(502, "GET /api/v1/stores/nearby"),
    );

    const result = await loadInitialNearbyStores(seongseongCenter);

    expect(result.status).toBe("success");
    expect(result.error).toBeNull();
    expect(result.stores.length).toBeGreaterThan(0);
  });

  it("예상하지 못한 오류는 route error boundary로 다시 던진다", async () => {
    getNearbyStoresMock.mockRejectedValue(new TypeError("mapper bug"));

    await expect(loadInitialNearbyStores(seongseongCenter)).rejects.toThrow("mapper bug");
  });
});

describe("StoresPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("선택 지역 좌표를 복원하지 못하면 주변 가게를 조회하지 않는다", async () => {
    getVerifiedSelectedRegionMock.mockResolvedValue(null);

    await StoresPage();

    expect(getAccessTokenMock).not.toHaveBeenCalled();
    expect(getNearbyStoresMock).not.toHaveBeenCalled();
  });

  it("광진구 고정값이 아닌 선택 지역 좌표로 최초 조회한다", async () => {
    getVerifiedSelectedRegionMock.mockResolvedValue({
      regionId: "4413310500",
      regionName: "충청남도 천안시 서북구 성성동",
      latitude: seongseongCenter.lat,
      longitude: seongseongCenter.lng,
    });
    getAccessTokenMock.mockResolvedValue("access-token");
    getNearbyStoresMock.mockResolvedValue({ totalCount: 0, stores: [] });

    await StoresPage();

    expect(getNearbyStoresMock).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: seongseongCenter.lat,
        longitude: seongseongCenter.lng,
      }),
    );
  });
});
