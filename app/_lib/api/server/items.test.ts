import { beforeEach, describe, expect, it, vi } from "vitest";

const { springFetchMock } = vi.hoisted(() => ({ springFetchMock: vi.fn() }));
vi.mock("../spring", () => ({ springFetch: springFetchMock }));

import { getItems, setItemFavorite } from "./items";

const ITEM_PAGE = {
  baseDate: "2026-08-16",
  totalCount: 0,
  categoryCounts: {},
  items: [],
  page: 0,
  size: 18,
  hasNext: false,
};

describe("items server API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    springFetchMock.mockResolvedValue({
      code: "SUCCESS",
      message: "요청이 성공적으로 처리되었습니다.",
      data: ITEM_PAGE,
    });
  });

  it("익명 품목 응답만 공개 캐시에 저장한다", async () => {
    const result = await getItems({
      regionId: "1121510100",
      page: 0,
      size: 18,
      sort: "NAME_ASC",
      favoriteOnly: false,
      token: undefined,
    });

    expect(springFetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/v1/items",
        token: undefined,
        cache: { revalidate: 300, tags: ["items"] },
      }),
    );
    expect(result).toEqual(ITEM_PAGE);
  });

  it("인증 품목 응답은 사용자 찜 상태가 섞이므로 캐시하지 않는다", async () => {
    await getItems({
      regionId: "1121510100",
      favoriteOnly: true,
      token: "access-token",
    });

    expect(springFetchMock).toHaveBeenCalledWith(
      expect.objectContaining({ token: "access-token", cache: "no-store" }),
    );
  });

  it.each([
    [true, "PUT"],
    [false, "DELETE"],
  ] as const)("liked=%s이면 %s favorite 요청을 보낸다", async (liked, method) => {
    await setItemFavorite({ itemId: 7, liked, token: "access-token" });

    expect(springFetchMock).toHaveBeenCalledWith({
      path: "/api/v1/items/7/favorite",
      method,
      token: "access-token",
      cache: "no-store",
    });
  });
});
