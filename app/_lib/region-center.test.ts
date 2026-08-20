import { describe, expect, it } from "vitest";
import { findRegionCenter, getRegionDisplayName } from "./region-center";

describe("findRegionCenter", () => {
  it("선택 지역명의 공덕동 중심을 반환한다", () => {
    expect(findRegionCenter("서울특별시 마포구 공덕동")).toEqual({
      lat: 37.549119,
      lng: 126.957786,
    });
  });

  it("알 수 없는 지역을 특정 좌표로 폴백하지 않는다", () => {
    expect(findRegionCenter("알 수 없는 지역")).toBeNull();
  });
});

describe("getRegionDisplayName", () => {
  it("지도 배지에 마지막 동명을 보여 준다", () => {
    expect(getRegionDisplayName("서울특별시 마포구 공덕동")).toBe("공덕동");
  });
});
