import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/app/_lib/api/api-error";

const { clearTokensMock, getAccessTokenMock, setItemFavoriteMock } = vi.hoisted(() => ({
  clearTokensMock: vi.fn(),
  getAccessTokenMock: vi.fn(),
  setItemFavoriteMock: vi.fn(),
}));

vi.mock("@/app/_lib/api/auth/session", () => ({
  clearTokens: clearTokensMock,
  getAccessToken: getAccessTokenMock,
}));
vi.mock("@/app/_lib/api/server/items", () => ({ setItemFavorite: setItemFavoriteMock }));

import { updateItemFavorite } from "./_actions";

describe("updateItemFavorite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    clearTokensMock.mockResolvedValue(undefined);
    getAccessTokenMock.mockResolvedValue("access-token");
    setItemFavoriteMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("httpOnly 세션 토큰으로 찜을 변경한다", async () => {
    await expect(updateItemFavorite(7, true)).resolves.toEqual({ status: "success" });

    expect(setItemFavoriteMock).toHaveBeenCalledWith({
      itemId: 7,
      liked: true,
      token: "access-token",
    });
  });

  it("세션 토큰이 없으면 Spring mutation을 호출하지 않는다", async () => {
    getAccessTokenMock.mockResolvedValue(undefined);

    await expect(updateItemFavorite(7, true)).resolves.toMatchObject({ status: "unauthorized" });
    expect(setItemFavoriteMock).not.toHaveBeenCalled();
  });

  it.each([401, 403])("Spring %i이면 세션을 지우고 rollback 결과를 반환한다", async (status) => {
    setItemFavoriteMock.mockRejectedValue(ApiError.fromStatus(status, "PUT /api/v1/items/7/favorite"));

    await expect(updateItemFavorite(7, true)).resolves.toMatchObject({
      status: "unauthorized",
    });
    expect(clearTokensMock).toHaveBeenCalledOnce();
  });

  it.each([
    ApiError.fromStatus(500, "PUT /api/v1/items/7/favorite"),
    ApiError.network("PUT /api/v1/items/7/favorite", new Error("timeout")),
    ApiError.parse("PUT /api/v1/items/7/favorite", "unexpected payload"),
  ])("%s이면 세션을 유지하고 rollback 결과를 반환한다", async (error) => {
    setItemFavoriteMock.mockRejectedValue(error);

    await expect(updateItemFavorite(7, true)).resolves.toMatchObject({ status: "error" });
    expect(clearTokensMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("품목 찜 변경 실패", {
      kind: error.kind,
      status: error.status,
      endpoint: error.endpoint,
    });
  });

  it("코드 예외를 재시도 가능한 API 실패로 숨기지 않는다", async () => {
    const error = new TypeError("cookie store failure");
    setItemFavoriteMock.mockRejectedValue(error);

    await expect(updateItemFavorite(7, true)).rejects.toBe(error);
    expect(clearTokensMock).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
});
