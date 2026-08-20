import { beforeEach, describe, expect, it, vi } from "vitest";

const { springFetchMock } = vi.hoisted(() => ({ springFetchMock: vi.fn() }));
vi.mock("../spring", () => ({ springFetch: springFetchMock }));

import { ensureCurrentUserRegion, getNearbyRegions } from "./regions";

describe("ensureCurrentUserRegion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("이미 현재 지역이면 목록만 조회한다", async () => {
    springFetchMock.mockResolvedValueOnce({
      regions: [{ regionId: "1144010200", regionName: "서울 마포구 공덕동", isCurrent: true }],
    });

    await ensureCurrentUserRegion({ regionId: "1144010200", token: "access-token" });

    expect(springFetchMock).toHaveBeenCalledTimes(1);
    expect(springFetchMock).toHaveBeenCalledWith({
      path: "/api/v1/users/me/regions",
      token: "access-token",
      schema: expect.anything(),
      cache: "no-store",
    });
  });

  it("등록된 지역이 현재 지역이 아니면 PUT으로 전환한다", async () => {
    springFetchMock
      .mockResolvedValueOnce({
        regions: [{ regionId: "1144010200", regionName: "서울 마포구 공덕동", isCurrent: false }],
      })
      .mockResolvedValueOnce(undefined);

    await ensureCurrentUserRegion({ regionId: "1144010200", token: "access-token" });

    expect(springFetchMock).toHaveBeenLastCalledWith({
      path: "/api/v1/users/me/regions/1144010200/current",
      method: "PUT",
      token: "access-token",
      cache: "no-store",
    });
  });

  it("등록되지 않은 지역은 POST 후 현재 지역으로 전환한다", async () => {
    springFetchMock
      .mockResolvedValueOnce({ regions: [] })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    await ensureCurrentUserRegion({ regionId: "1144010200", token: "access-token" });

    expect(springFetchMock).toHaveBeenNthCalledWith(2, {
      path: "/api/v1/users/me/regions",
      method: "POST",
      body: { regionId: "1144010200" },
      token: "access-token",
      cache: "no-store",
    });
    expect(springFetchMock).toHaveBeenNthCalledWith(3, {
      path: "/api/v1/users/me/regions/1144010200/current",
      method: "PUT",
      token: "access-token",
      cache: "no-store",
    });
  });
});

describe("getNearbyRegions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Spring envelope의 data만 BFF 지역 배열로 반환한다", async () => {
    springFetchMock.mockResolvedValue({
      code: "SUCCESS",
      message: "요청이 성공적으로 처리되었습니다.",
      data: [{ regionId: "1156011600", regionName: "영등포구 당산동6가" }],
    });

    await expect(getNearbyRegions({ latitude: 37.535, longitude: 126.9 })).resolves.toEqual([
      { regionId: "1156011600", regionName: "영등포구 당산동6가" },
    ]);
    expect(springFetchMock).toHaveBeenCalledWith({
      path: "/api/v1/regions/nearby",
      query: { latitude: 37.535, longitude: 126.9 },
      schema: expect.anything(),
      cache: { revalidate: 3_600, tags: ["regions"] },
    });
  });
});
