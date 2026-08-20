import { beforeEach, describe, expect, it, vi } from "vitest";

const regionMocks = vi.hoisted(() => ({
  resolveSelectedRegionCoordinates: vi.fn(),
  saveSelectedRegion: vi.fn(),
}));

vi.mock("@/app/_lib/api/server/selected-region", () => ({
  resolveSelectedRegionCoordinates: regionMocks.resolveSelectedRegionCoordinates,
  saveSelectedRegion: regionMocks.saveSelectedRegion,
}));

import { POST } from "./route";

const locatedRegion = {
  regionId: "4413310500",
  regionName: "충청남도 천안시 서북구 성성동",
  latitude: 36.8358,
  longitude: 127.1324,
};

function selectionRequest(body: unknown): Request {
  return new Request("http://localhost/api/regions/selection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/regions/selection", () => {
  beforeEach(() => {
    regionMocks.resolveSelectedRegionCoordinates.mockReset();
    regionMocks.saveSelectedRegion.mockReset();
  });

  it("복원·검증한 좌표만 선택 지역으로 저장하고 반환한다", async () => {
    regionMocks.resolveSelectedRegionCoordinates.mockResolvedValue(locatedRegion);

    const response = await POST(
      selectionRequest({
        regionId: locatedRegion.regionId,
        regionName: locatedRegion.regionName,
      }),
    );

    expect(regionMocks.saveSelectedRegion).toHaveBeenCalledWith(locatedRegion);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(locatedRegion);
  });

  it("일치하는 regionId의 좌표를 찾지 못하면 저장하지 않고 재선택을 요청한다", async () => {
    regionMocks.resolveSelectedRegionCoordinates.mockResolvedValue(null);

    const response = await POST(
      selectionRequest({
        regionId: locatedRegion.regionId,
        regionName: locatedRegion.regionName,
      }),
    );

    expect(response.status).toBe(422);
    expect(regionMocks.saveSelectedRegion).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      message: "동네 좌표를 확인하지 못했어요. 동네를 다시 선택해 주세요.",
    });
  });

  it("위도만 있는 불완전한 좌표는 복원 전에 400으로 거부한다", async () => {
    const response = await POST(
      selectionRequest({
        regionId: locatedRegion.regionId,
        regionName: locatedRegion.regionName,
        latitude: locatedRegion.latitude,
      }),
    );

    expect(response.status).toBe(400);
    expect(regionMocks.resolveSelectedRegionCoordinates).not.toHaveBeenCalled();
    expect(regionMocks.saveSelectedRegion).not.toHaveBeenCalled();
  });
});
