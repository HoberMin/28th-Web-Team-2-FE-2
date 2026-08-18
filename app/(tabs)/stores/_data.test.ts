import { describe, expect, it } from "vitest";
import type { NearbyStore } from "@/app/_lib/api/schemas/stores";
import { formatStoreDistance, mapNearbyStoreToMapStore, type MapCenter } from "./_data";

const center: MapCenter = { lat: 37.5, lng: 127 };

function createNearbyStore(patch: Partial<NearbyStore> = {}): NearbyStore {
  return {
    storeId: 123,
    storeName: "장보고 마트",
    latitude: center.lat,
    longitude: center.lng,
    addressName: "서울 광진구 예시동 1",
    roadAddressName: "서울 광진구 예시로 1",
    phone: "02-123-4567",
    distanceMeters: 670,
    isLiked: true,
    ...patch,
  };
}

describe("mapNearbyStoreToMapStore", () => {
  it("API 응답을 지도에서 지원하는 필드만으로 변환한다", () => {
    expect(mapNearbyStoreToMapStore(createNearbyStore(), center, 2000)).toEqual({
      id: "123",
      name: "장보고 마트",
      lat: center.lat,
      lng: center.lng,
      x: 50,
      y: 50,
      address: "서울 광진구 예시로 1",
      phone: "02-123-4567",
      distanceMeters: 670,
      isLiked: true,
    });
  });

  it("도로명 주소가 없으면 지번 주소를 사용한다", () => {
    expect(
      mapNearbyStoreToMapStore(createNearbyStore({ roadAddressName: undefined }), center, 2000)
        .address,
    ).toBe("서울 광진구 예시동 1");
  });

  it("SDK 폴백 좌표는 지도 영역 밖으로 벗어나지 않는다", () => {
    const mapped = mapNearbyStoreToMapStore(
      createNearbyStore({ latitude: 90, longitude: 180 }),
      center,
      2000,
    );

    expect(mapped.x).toBe(100);
    expect(mapped.y).toBe(0);
  });
});

describe("formatStoreDistance", () => {
  it("1km 미만은 미터, 이상은 km로 표시한다", () => {
    expect(formatStoreDistance(670)).toBe("670m");
    expect(formatStoreDistance(1250)).toBe("1.3km");
    expect(formatStoreDistance(undefined)).toBeUndefined();
  });
});
