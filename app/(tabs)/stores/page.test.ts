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
      key: "36.8358|127.1324|2000||false",
      status: "success",
      stores: [
        { id: "999", name: "아!싸다 마트" },
        { id: "101", name: "장보고 마트", isLiked: true },
      ],
    });
    expect(getNearbyStoresMock).toHaveBeenCalledWith({
      latitude: seongseongCenter.lat,
      longitude: seongseongCenter.lng,
      radius: 2000,
      onlyLiked: false,
      token: "access-token",
    });
  });

  it("live backend 502는 에러 상태로 넘긴다(더미로 가리지 않는다)", async () => {
    // 예전엔 이 실패를 `getNearbyStoresWithTemporaryFallback`이 삼키고 더미로 채웠는데,
    // 더미 storeId가 라이브 실제 storeId와 겹쳐서 목록엔 더미가 보이고 눌러서 들어가면
    // 다른 진짜 가게가 뜨는 버그로 이어졌다(2026-08-21 리포트). 지금은 실패를 그대로
    // "error" 상태로 넘겨 화면이 정직한 에러 문구를 보여준다.
    getNearbyStoresMock.mockRejectedValue(
      ApiError.fromStatus(502, "GET /api/v1/stores/nearby"),
    );

    const result = await loadInitialNearbyStores(seongseongCenter);

    expect(result.status).toBe("error");
    expect(result.error).toBe("주변 가게를 불러오지 못했어요.");
    expect(result.stores).toMatchObject([{ id: "999", name: "아!싸다 마트" }]);
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

  it("선택 지역과 무관하게 아!싸다 마트 중심으로 최초 조회한다", async () => {
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
        latitude: 37.5461281,
        longitude: 126.955084,
      }),
    );
  });
});
