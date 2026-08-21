import { describe, expect, it } from "vitest";
import type { KakaoGlobal, KakaoPlaceSearchResult } from "./kakao-map";
import {
  KakaoPlacesClientError,
  searchNearbyStorePlacesWithSdk,
} from "./kakao-places-client";

function createKakao(results: KakaoPlaceSearchResult[]): KakaoGlobal {
  const services = {
    Places: class {
      keywordSearch(
        _keyword: string,
        callback: (items: KakaoPlaceSearchResult[], status: string) => void,
      ): void {
        callback(results, "OK");
      }
    },
    SortBy: { DISTANCE: "DISTANCE" },
    Status: { OK: "OK", ZERO_RESULT: "ZERO_RESULT", ERROR: "ERROR" },
  };

  return {
    maps: {
      LatLng: class {
        constructor(
          private readonly lat: number,
          private readonly lng: number,
        ) {}

        getLat(): number {
          return this.lat;
        }

        getLng(): number {
          return this.lng;
        }
      },
      services,
    },
  } as unknown as KakaoGlobal;
}

describe("searchNearbyStorePlacesWithSdk", () => {
  it("테스트 앱 JS SDK 결과를 제보 장소로 변환하고 중복을 제거한다", async () => {
    const kakao = createKakao([
      {
        id: "123",
        place_name: "공덕청과",
        address_name: "서울 마포구 공덕동",
        road_address_name: "서울 마포구 마포대로 1",
        distance: "120",
        x: "126.957",
        y: "37.549",
      },
    ]);

    await expect(
      searchNearbyStorePlacesWithSdk({
        kakao,
        center: { lat: 37.549119, lng: 126.957786 },
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        id: "999",
        placeName: "아!싸다 마트",
      }),
      expect.objectContaining({
        id: "123",
        placeName: "공덕청과",
        distance: 120,
        x: 126.957,
        y: 37.549,
      }),
    ]);
  });

  it("services 라이브러리가 없으면 검색 오류로 처리한다", async () => {
    const kakao = { maps: {} } as KakaoGlobal;

    await expect(
      searchNearbyStorePlacesWithSdk({
        kakao,
        center: { lat: 37.549119, lng: 126.957786 },
      }),
    ).rejects.toBeInstanceOf(KakaoPlacesClientError);
  });
});
