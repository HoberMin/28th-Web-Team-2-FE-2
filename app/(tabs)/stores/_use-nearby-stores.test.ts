import { describe, expect, it } from "vitest";
import {
  createNearbyStoresRequestKey,
  shouldFetchNearbyStores,
} from "./_nearby-state";

describe("nearby stores request state", () => {
  it("서버 snapshot과 같은 요청 키면 클라이언트 중복 조회를 생략한다", () => {
    const key = createNearbyStoresRequestKey({
      center: { lat: 37.5384, lng: 127.0822 },
      radius: 2000,
      keyword: "  ",
      onlyLiked: false,
    });

    expect(shouldFetchNearbyStores(key, "37.5384|127.0822|2000||false")).toBe(false);
  });

  it("지도 중심이나 필터가 바뀌면 클라이언트 조회가 필요하다", () => {
    expect(
      shouldFetchNearbyStores(
        "37.5384|127.0822|2000||false",
        "37.6|127.1|2000||false",
      ),
    ).toBe(true);
  });
});
