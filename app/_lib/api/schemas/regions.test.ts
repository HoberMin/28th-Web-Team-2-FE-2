import { describe, expect, it } from "vitest";
import {
  hasRegionCoordinates,
  nearbyRegionRequestSchema,
  regionSchema,
  regionSearchEnvelopeSchema,
  regionSearchRequestSchema,
  resolveRegionSelection,
} from "./regions";

describe("regionSchema", () => {
  it("숫자로 받은 9자리 서울 법정동 코드의 앞자리 0을 복원한다", () => {
    expect(regionSchema.parse({ regionId: 111_010_100, regionName: "서울특별시 종로구 청운동" }))
      .toEqual({ regionId: "0111010100", regionName: "서울특별시 종로구 청운동" });
  });

  it.each([12_345_678_901, 12_345_678, "11440102"])(
    "10자리로 복원할 수 없는 regionId를 거부한다: %s",
    (regionId) => {
      expect(regionSchema.safeParse({ regionId, regionName: "잘못된 동네" }).success).toBe(false);
    },
  );

  it("검색 결과의 위도와 경도를 숫자로 보존한다", () => {
    const region = regionSchema.parse({
      regionId: "4413310500",
      regionName: "충청남도 천안시 서북구 성성동",
      latitude: 36.8358,
      longitude: 127.1324,
    });

    expect(hasRegionCoordinates(region)).toBe(true);
    expect(region).toMatchObject({ latitude: 36.8358, longitude: 127.1324 });
  });

  it("좌표가 없는 기존 선택 지역은 같은 regionId 검색 결과로 복구한다", () => {
    expect(
      resolveRegionSelection(
        { regionId: "1144010200", regionName: "공덕동" },
        [
          {
            regionId: "1144010200",
            regionName: "서울특별시 마포구 공덕동",
            latitude: 37.549119,
            longitude: 126.957786,
          },
        ],
      ),
    ).toEqual({
      regionId: "1144010200",
      regionName: "서울특별시 마포구 공덕동",
      latitude: 37.549119,
      longitude: 126.957786,
    });
  });

  it("동명이 같아도 regionId가 다르면 좌표를 사용하지 않는다", () => {
    expect(
      resolveRegionSelection(
        { regionId: "1156011000", regionName: "공덕동" },
        [
          {
            regionId: "1144010200",
            regionName: "서울 마포구 공덕동",
            latitude: 37.549119,
            longitude: 126.957786,
          },
        ],
      ),
    ).toBeNull();
  });

  it.each([
    {},
    { latitude: null, longitude: 127.1324 },
    { latitude: 36.8358, longitude: null },
  ])("지역 검색 결과의 좌표가 없거나 null이면 거부한다", (coordinates) => {
    expect(
      regionSearchEnvelopeSchema.safeParse({
        data: {
          searchResults: [
            {
              regionId: "4413310500",
              regionName: "충청남도 천안시 서북구 성성동",
              ...coordinates,
            },
          ],
        },
      }).success,
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
