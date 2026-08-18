import { beforeEach, describe, expect, it, vi } from "vitest";

const { springFetchMock } = vi.hoisted(() => ({ springFetchMock: vi.fn() }));
vi.mock("../spring", () => ({ springFetch: springFetchMock }));

import { getNearbyStores } from "./stores";

describe("getNearbyStores", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    springFetchMock.mockResolvedValue({
      code: "SUCCESS",
      message: "요청이 성공적으로 처리되었습니다.",
      data: { totalCount: 0, stores: [] },
    });
  });

  it("익명 주변 가게 응답만 300초 공유 캐시에 저장한다", async () => {
    const result = await getNearbyStores({
      latitude: 37.5384,
      longitude: 127.0822,
      radius: 2000,
      token: undefined,
    });

    expect(result).toEqual({ totalCount: 0, stores: [] });
    expect(springFetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        token: undefined,
        cache: { revalidate: 300, tags: ["stores"] },
      }),
    );
  });

  it("인증 주변 가게 응답은 사용자 찜 상태가 섞이므로 캐시하지 않는다", async () => {
    await getNearbyStores({
      latitude: 37.5384,
      longitude: 127.0822,
      radius: 2000,
      token: "access-token",
    });

    expect(springFetchMock).toHaveBeenCalledWith(
      expect.objectContaining({ token: "access-token", cache: "no-store" }),
    );
  });
});
