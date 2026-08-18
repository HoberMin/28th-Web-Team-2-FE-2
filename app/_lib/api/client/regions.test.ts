import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegionClientError, searchRegionsAPI } from "./regions";

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
      Response.json([{ regionId: 111_010_100, regionName: "서울특별시 종로구 청운동" }]),
    );

    await expect(searchRegionsAPI("청운동")).resolves.toEqual([
      { regionId: "0111010100", regionName: "서울특별시 종로구 청운동" },
    ]);
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
