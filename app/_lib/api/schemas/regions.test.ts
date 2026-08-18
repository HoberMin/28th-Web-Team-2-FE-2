import { describe, expect, it } from "vitest";
import {
  nearbyRegionRequestSchema,
  regionSchema,
  regionSearchRequestSchema,
} from "./regions";

describe("regionSchema", () => {
  it("숫자로 받은 9자리 서울 법정동 코드의 앞자리 0을 복원한다", () => {
    expect(regionSchema.parse({ regionId: 111_010_100, regionName: "서울특별시 종로구 청운동" }))
      .toEqual({ regionId: "0111010100", regionName: "서울특별시 종로구 청운동" });
  });

  it("보정 후에도 10자리가 아닌 법정동 코드는 거부한다", () => {
    expect(
      regionSchema.safeParse({ regionId: 12_345_678_901, regionName: "잘못된 동네" }).success,
    ).toBe(false);
  });
});

describe("regionSearchRequestSchema", () => {
  it("두 글자 미만 검색어와 비한글 검색어를 거부한다", () => {
    expect(regionSearchRequestSchema.safeParse({ keyword: "동" }).success).toBe(false);
    expect(regionSearchRequestSchema.safeParse({ keyword: "A동" }).success).toBe(false);
  });

  it("공백으로 구분된 한글 법정동 검색어를 허용한다", () => {
    expect(regionSearchRequestSchema.parse({ keyword: " 종로구 청운동 " })).toEqual({
      keyword: "종로구 청운동",
    });
  });
});

describe("nearbyRegionRequestSchema", () => {
  it("WGS84 범위를 벗어난 좌표를 거부한다", () => {
    expect(nearbyRegionRequestSchema.safeParse({ latitude: 91, longitude: 127 }).success)
      .toBe(false);
    expect(nearbyRegionRequestSchema.safeParse({ latitude: 37, longitude: 181 }).success)
      .toBe(false);
  });
});
