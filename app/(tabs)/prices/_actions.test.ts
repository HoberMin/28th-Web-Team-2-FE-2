import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/app/_lib/api/api-error";

const { getAccessTokenMock, revalidatePathMock, setItemFavoriteMock } = vi.hoisted(() => ({
  getAccessTokenMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  setItemFavoriteMock: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("@/app/_lib/api/auth/session", () => ({ getAccessToken: getAccessTokenMock }));
vi.mock("@/app/_lib/api/server/items", () => ({ setItemFavorite: setItemFavoriteMock }));

import { updateItemFavorite } from "./_actions";

describe("updateItemFavorite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAccessTokenMock.mockResolvedValue("access-token");
    setItemFavoriteMock.mockResolvedValue(undefined);
  });

  it("httpOnly 세션 토큰으로 찜을 변경하고 관련 화면을 갱신한다", async () => {
    await expect(updateItemFavorite(7, true)).resolves.toEqual({ status: "success" });

    expect(setItemFavoriteMock).toHaveBeenCalledWith({
      itemId: 7,
      liked: true,
      token: "access-token",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/prices");
    expect(revalidatePathMock).toHaveBeenCalledWith("/saved");
  });

  it("세션 토큰이 없으면 Spring mutation을 호출하지 않는다", async () => {
    getAccessTokenMock.mockResolvedValue(undefined);

    await expect(updateItemFavorite(7, true)).resolves.toMatchObject({ status: "unauthorized" });
    expect(setItemFavoriteMock).not.toHaveBeenCalled();
  });

  it.each([401, 500])("Spring %i 실패를 클라이언트가 rollback할 결과로 반환한다", async (status) => {
    setItemFavoriteMock.mockRejectedValue(ApiError.fromStatus(status, "PUT /api/v1/items/7/favorite"));

    await expect(updateItemFavorite(7, true)).resolves.toMatchObject({
      status: status === 401 ? "unauthorized" : "error",
    });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
