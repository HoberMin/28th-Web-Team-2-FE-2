import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
  getNearbyStores: vi.fn(),
}));

vi.mock("@/app/_lib/api/auth/session", () => ({
  getAccessToken: apiMocks.getAccessToken,
}));
vi.mock("@/app/_lib/api/server/stores", () => ({
  getNearbyStores: apiMocks.getNearbyStores,
}));

import { GET } from "./route";

describe("GET /api/stores/nearby", () => {
  beforeEach(() => {
    apiMocks.getAccessToken.mockReset();
    apiMocks.getNearbyStores.mockReset();
  });

  it("유효하지 않은 조건은 세션과 upstream을 읽기 전에 400으로 거부한다", async () => {
    const response = await GET(
      new Request("http://localhost/api/stores/nearby?latitude=91&longitude=127"),
    );

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(apiMocks.getAccessToken).not.toHaveBeenCalled();
    expect(apiMocks.getNearbyStores).not.toHaveBeenCalled();
  });

  it.each([
    "http://localhost/api/stores/nearby?latitude=&longitude=127.0632",
    "http://localhost/api/stores/nearby?latitude=%20%20&longitude=127.0632",
    "http://localhost/api/stores/nearby?latitude=37.5088&longitude=",
    "http://localhost/api/stores/nearby?latitude=37.5088&longitude=%20%20",
  ])("빈 필수 좌표를 0으로 바꾸지 않고 400으로 거부한다: %s", async (url) => {
    const response = await GET(new Request(url));

    expect(response.status).toBe(400);
    expect(apiMocks.getAccessToken).not.toHaveBeenCalled();
    expect(apiMocks.getNearbyStores).not.toHaveBeenCalled();
  });

  it("httpOnly 세션 토큰과 검증된 조건을 서버 API에 전달한다", async () => {
    apiMocks.getAccessToken.mockResolvedValue("access-token");
    apiMocks.getNearbyStores.mockResolvedValue({
      totalCount: 1,
      stores: [
        {
          storeId: 101,
          storeName: "장보고 마트",
          latitude: 37.5088,
          longitude: 127.0632,
          isLiked: false,
        },
      ],
    });

    const response = await GET(
      new Request(
        "http://localhost/api/stores/nearby?latitude=37.5088&longitude=127.0632&radius=1500&onlyLiked=true&keyword=%EC%9E%A5%EB%B3%B4%EA%B3%A0",
      ),
    );

    expect(apiMocks.getNearbyStores).toHaveBeenCalledWith({
      latitude: 37.5088,
      longitude: 127.0632,
      radius: 1500,
      onlyLiked: true,
      keyword: "장보고",
      token: "access-token",
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    const body = (await response.json()) as { totalCount: number; stores: unknown[] };
    expect(body.totalCount).toBe(1);
    expect(body.stores).toHaveLength(1);
  });

  it("로그아웃 상태도 token을 명시해 서버 API를 호출한다", async () => {
    apiMocks.getAccessToken.mockResolvedValue(undefined);
    apiMocks.getNearbyStores.mockResolvedValue({
      totalCount: 1,
      stores: [
        {
          storeId: 101,
          storeName: "장보고 마트",
          latitude: 37.5088,
          longitude: 127.0632,
          isLiked: false,
        },
      ],
    });

    await GET(
      new Request("http://localhost/api/stores/nearby?latitude=37.5088&longitude=127.0632"),
    );

    expect(apiMocks.getNearbyStores).toHaveBeenCalledWith({
      latitude: 37.5088,
      longitude: 127.0632,
      radius: 500,
      onlyLiked: false,
      keyword: undefined,
      token: undefined,
    });
  });

  it("DB가 비어 upstream이 200과 빈 목록을 주면 더미 가게로 채운다", async () => {
    apiMocks.getAccessToken.mockResolvedValue(undefined);
    apiMocks.getNearbyStores.mockResolvedValue({ totalCount: 0, stores: [] });

    const response = await GET(
      new Request("http://localhost/api/stores/nearby?latitude=37.5088&longitude=127.0632"),
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { totalCount: number; stores: unknown[] };
    expect(body.totalCount).toBeGreaterThan(0);
    expect(body.stores.length).toBeGreaterThan(0);
  });
});
