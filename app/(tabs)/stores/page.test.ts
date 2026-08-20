import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/app/_lib/api/api-error";

const { getAccessTokenMock, getNearbyStoresMock } = vi.hoisted(() => ({
  getAccessTokenMock: vi.fn(),
  getNearbyStoresMock: vi.fn(),
}));

vi.mock("@/app/_lib/api/auth/session", () => ({ getAccessToken: getAccessTokenMock }));
vi.mock("@/app/_lib/api/server/stores", () => ({ getNearbyStores: getNearbyStoresMock }));

import { loadInitialNearbyStores } from "./_initial-nearby";

const gongdeokCenter = { lat: 37.549119, lng: 126.957786 };

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
          latitude: gongdeokCenter.lat,
          longitude: gongdeokCenter.lng,
          isLiked: true,
        },
      ],
    });

    await expect(loadInitialNearbyStores(gongdeokCenter)).resolves.toMatchObject({
      key: "37.549119|126.957786|500||false",
      status: "success",
      stores: [{ id: "101", name: "장보고 마트", isLiked: true }],
    });
    expect(getNearbyStoresMock).toHaveBeenCalledWith({
      latitude: gongdeokCenter.lat,
      longitude: gongdeokCenter.lng,
      radius: 500,
      onlyLiked: false,
      token: "access-token",
    });
  });

  it("live backend 502를 초기 오류 상태로 격리한다", async () => {
    getNearbyStoresMock.mockRejectedValue(
      ApiError.fromStatus(502, "GET /api/v1/stores/nearby"),
    );

    await expect(loadInitialNearbyStores(gongdeokCenter)).resolves.toMatchObject({
      status: "error",
      stores: [],
      error: "주변 가게를 불러오지 못했어요.",
    });
  });

  it("예상하지 못한 오류는 route error boundary로 다시 던진다", async () => {
    getNearbyStoresMock.mockRejectedValue(new TypeError("mapper bug"));

    await expect(loadInitialNearbyStores(gongdeokCenter)).rejects.toThrow("mapper bug");
  });
});
