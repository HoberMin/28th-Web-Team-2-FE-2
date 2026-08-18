import { describe, expect, it } from "vitest";
import {
  DEFAULT_NEARBY_STORE_RADIUS,
  nearbyStoresRequestSchema,
  nearbyStoresSchema,
} from "./stores";

describe("nearbyStoresRequestSchema", () => {
  it("쿼리 문자열을 조회 타입으로 바꾸고 기본값을 채운다", () => {
    expect(
      nearbyStoresRequestSchema.parse({
        latitude: "37.5088",
        longitude: "127.0632",
        keyword: "  장보고 마트  ",
      }),
    ).toEqual({
      latitude: 37.5088,
      longitude: 127.0632,
      radius: DEFAULT_NEARBY_STORE_RADIUS,
      onlyLiked: false,
      keyword: "장보고 마트",
    });
  });

  it("빈 검색어는 upstream 쿼리에서 생략하도록 정규화한다", () => {
    expect(
      nearbyStoresRequestSchema.parse({
        latitude: 37.5088,
        longitude: 127.0632,
        keyword: "   ",
      }).keyword,
    ).toBeUndefined();
  });

  it.each([
    { latitude: undefined, longitude: 127.0632 },
    { latitude: "", longitude: 127.0632 },
    { latitude: "   ", longitude: 127.0632 },
    { latitude: null, longitude: 127.0632 },
    { latitude: 37.5088, longitude: "" },
    { latitude: 37.5088, longitude: "   " },
    { latitude: 37.5088, longitude: null },
    { latitude: 91, longitude: 127.0632 },
    { latitude: 37.5088, longitude: -181 },
    { latitude: 37.5088, longitude: 127.0632, radius: 5001 },
    { latitude: 37.5088, longitude: 127.0632, radius: 10.5 },
    { latitude: 37.5088, longitude: 127.0632, onlyLiked: "yes" },
  ])("계약 범위를 벗어난 조회 조건을 거부한다: %o", (input) => {
    expect(nearbyStoresRequestSchema.safeParse(input).success).toBe(false);
  });
});

describe("nearbyStoresSchema", () => {
  it("누락되거나 null인 찜 여부는 공유 화면에서 false로 취급한다", () => {
    const baseStore = {
      storeId: 1,
      storeName: "장보고 마트",
      latitude: 37.5088,
      longitude: 127.0632,
    };

    expect(
      nearbyStoresSchema.parse({
        totalCount: 2,
        stores: [baseStore, { ...baseStore, storeId: 2, isLiked: null }],
      }).stores.map((store) => store.isLiked),
    ).toEqual([false, false]);
  });
});
