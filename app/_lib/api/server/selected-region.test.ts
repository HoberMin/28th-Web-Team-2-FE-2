import { describe, expect, it, vi } from "vitest";

const { searchRegionsMock } = vi.hoisted(() => ({ searchRegionsMock: vi.fn() }));
vi.mock("./regions", () => ({ searchRegions: searchRegionsMock }));

import { resolveSelectedRegionCoordinates } from "./selected-region";

describe("resolveSelectedRegionCoordinates", () => {
  it("좌표 없는 선택 지역은 저장된 전체 regionName으로 검색해 동일 regionId를 확인한다", async () => {
    searchRegionsMock.mockResolvedValue([
      {
        regionId: "1156011600",
        regionName: "서울특별시 영등포구 당산동6가",
        latitude: 37.535,
        longitude: 126.9,
      },
    ]);

    await expect(
      resolveSelectedRegionCoordinates({
        regionId: "1156011600",
        regionName: "영등포구 당산동6가",
      }),
    ).resolves.toMatchObject({
      regionId: "1156011600",
      latitude: 37.535,
      longitude: 126.9,
    });
    expect(searchRegionsMock).toHaveBeenCalledWith("영등포구 당산동6가");
  });

  it("숫자 없는 동이름도 전체 regionName을 검색한다", async () => {
    searchRegionsMock.mockResolvedValue([]);

    await expect(
      resolveSelectedRegionCoordinates({ regionId: "1144010200", regionName: "공덕동" }),
    ).resolves.toBeNull();
    expect(searchRegionsMock).toHaveBeenCalledWith("공덕동");
  });
});
