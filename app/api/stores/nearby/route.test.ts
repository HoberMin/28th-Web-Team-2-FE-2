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
      radius: 2000,
      onlyLiked: false,
      keyword: undefined,
      token: undefined,
    });
  });

  it("upstream이 200과 빈 목록을 주면 더미로 채우지 않고 그대로 빈 목록을 돌려준다", async () => {
    // 더미 storeId(1,2,3…)가 라이브 실제 storeId와 겹쳐 "목록엔 더미가 보이는데 눌러서
    // 들어가면 다른 진짜 가게가 뜬다"는 버그(2026-08-21 리포트)의 원인이었다 — 진짜 빈
    // 결과는 화면의 "검색 결과가 없어요" 빈 상태가 처리하므로 여기서 채울 필요가 없다.
    apiMocks.getAccessToken.mockResolvedValue(undefined);
    apiMocks.getNearbyStores.mockResolvedValue({ totalCount: 0, stores: [] });

    const response = await GET(
      new Request("http://localhost/api/stores/nearby?latitude=37.5088&longitude=127.0632"),
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { totalCount: number; stores: unknown[] };
    expect(body.totalCount).toBe(0);
    expect(body.stores).toHaveLength(0);
  });
});
