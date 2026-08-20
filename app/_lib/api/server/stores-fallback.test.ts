import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api-error";

const { getNearbyStoresMock } = vi.hoisted(() => ({ getNearbyStoresMock: vi.fn() }));
vi.mock("./stores", () => ({ getNearbyStores: getNearbyStoresMock }));

import { getNearbyStoresWithTemporaryFallback } from "./stores-fallback";

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
