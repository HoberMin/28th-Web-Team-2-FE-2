import { describe, expect, it, vi } from "vitest";

const { searchRegionsMock } = vi.hoisted(() => ({ searchRegionsMock: vi.fn() }));
vi.mock("./regions", () => ({ searchRegions: searchRegionsMock }));

import { resolveSelectedRegionCoordinates } from "./selected-region";

describe("resolveSelectedRegionCoordinates", () => {
  it("숫자가 포함된 법정동명은 순수 동이름으로 검색해 동일 regionId를 확인한다", async () => {
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
    expect(searchRegionsMock).toHaveBeenCalledWith("당산동");
  });

  it("숫자 없는 동이름은 마지막 토큰을 그대로 검색한다", async () => {
    searchRegionsMock.mockResolvedValue([]);

    await expect(
      resolveSelectedRegionCoordinates({ regionId: "1144010200", regionName: "공덕동" }),
    ).resolves.toBeNull();
    expect(searchRegionsMock).toHaveBeenCalledWith("공덕동");
  });
});
