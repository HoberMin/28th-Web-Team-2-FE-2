import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegionClientError, saveSelectedRegionAPI, searchRegionsAPI } from "./regions";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("searchRegionsAPI", () => {
  it("두 글자 미만이면 BFF를 호출하지 않는다", async () => {
    await expect(searchRegionsAPI("동")).rejects.toMatchObject({
      status: 400,
    } satisfies Partial<RegionClientError>);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("BFF 응답의 숫자 법정동 코드를 10자리 문자열로 보존한다", async () => {
    fetchMock.mockResolvedValue(
      Response.json([
        {
          regionId: 111_010_100,
          regionName: "서울특별시 종로구 청운동",
          latitude: 37.5858,
          longitude: 126.9706,
        },
      ]),
    );

    await expect(searchRegionsAPI("청운동")).resolves.toEqual([
      {
        regionId: "0111010100",
        regionName: "서울특별시 종로구 청운동",
        latitude: 37.5858,
        longitude: 126.9706,
      },
    ]);
  });

  it.each([
    { regionId: "4413310500", regionName: "충청남도 천안시 서북구 성성동" },
    {
      regionId: "4413310500",
      regionName: "충청남도 천안시 서북구 성성동",
      latitude: null,
      longitude: 127.1324,
    },
  ])("검색 결과의 좌표가 없거나 null이면 정상 지역으로 처리하지 않는다", async (region) => {
    fetchMock.mockResolvedValue(Response.json([region]));

    await expect(searchRegionsAPI("성성동")).rejects.toMatchObject({
      status: 502,
      message: "동네 좌표를 확인하지 못했어요. 동네를 다시 선택해 주세요.",
    } satisfies Partial<RegionClientError>);
  });

  it("BFF 5xx 메시지를 상태 코드와 함께 전달한다", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ message: "동네를 불러오지 못했어요." }, { status: 502 }),
    );

    await expect(searchRegionsAPI("청운동")).rejects.toMatchObject({
      status: 502,
      message: "동네를 불러오지 못했어요.",
    } satisfies Partial<RegionClientError>);
  });
});

describe("saveSelectedRegionAPI", () => {
  it("BFF가 검증·복원한 선택 지역 좌표를 반환한다", async () => {
    const locatedRegion = {
      regionId: "4413310500",
      regionName: "충청남도 천안시 서북구 성성동",
      latitude: 36.8358,
      longitude: 127.1324,
    };
    fetchMock.mockResolvedValue(Response.json(locatedRegion));

    await expect(
      saveSelectedRegionAPI({
        regionId: locatedRegion.regionId,
        regionName: locatedRegion.regionName,
      }),
    ).resolves.toEqual(locatedRegion);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/regions/selection",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
      }),
    );
  });

  it("BFF 응답에 좌표가 없으면 선택 지역으로 저장하지 않는다", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        regionId: "4413310500",
        regionName: "충청남도 천안시 서북구 성성동",
      }),
    );

    await expect(
      saveSelectedRegionAPI({
        regionId: "4413310500",
        regionName: "충청남도 천안시 서북구 성성동",
      }),
    ).rejects.toMatchObject({ status: 502 } satisfies Partial<RegionClientError>);
  });
});
