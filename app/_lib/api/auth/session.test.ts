import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACCESS_COOKIE_OPTIONS,
  ACCESS_TOKEN_COOKIE,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE,
} from "./tokens";

const cookieMocks = vi.hoisted(() => {
  const get = vi.fn<(name: string) => { value: string } | undefined>();
  const set = vi.fn<(name: string, value: string, options: Record<string, unknown>) => void>();
  const remove = vi.fn<(name: string) => void>();
  const cookies = vi.fn(async () => ({ get, set, delete: remove }));
  return { cookies, get, set, remove };
});

vi.mock("next/headers", () => ({ cookies: cookieMocks.cookies }));

import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./session";

describe("auth session", () => {
  beforeEach(() => {
    cookieMocks.cookies.mockClear();
    cookieMocks.get.mockReset();
    cookieMocks.set.mockReset();
    cookieMocks.remove.mockReset();
  });

  it("요청 쿠키에서 accessToken과 refreshToken을 각각 읽는다", async () => {
    cookieMocks.get.mockImplementation((name) => {
      if (name === ACCESS_TOKEN_COOKIE) return { value: "access-token" };
      if (name === REFRESH_TOKEN_COOKIE) return { value: "refresh-token" };
      return undefined;
    });

    await expect(getAccessToken()).resolves.toBe("access-token");
    await expect(getRefreshToken()).resolves.toBe("refresh-token");
  });

  it("없는 세션 쿠키는 undefined로 반환한다", async () => {
    cookieMocks.get.mockReturnValue(undefined);

    await expect(getAccessToken()).resolves.toBeUndefined();
    await expect(getRefreshToken()).resolves.toBeUndefined();
  });

  it("발급받은 accessToken과 refreshToken을 지정 옵션으로 저장한다", async () => {
    await saveTokens({ accessToken: "new-access", refreshToken: "new-refresh" });

    expect(cookieMocks.set).toHaveBeenNthCalledWith(
      1,
      ACCESS_TOKEN_COOKIE,
      "new-access",
      ACCESS_COOKIE_OPTIONS,
    );
    expect(cookieMocks.set).toHaveBeenNthCalledWith(
      2,
      REFRESH_TOKEN_COOKIE,
      "new-refresh",
      REFRESH_COOKIE_OPTIONS,
    );
  });

  it("재발급 응답에 refreshToken이 없으면 기존 refresh 쿠키를 유지한다", async () => {
    await saveTokens({ accessToken: "new-access", refreshToken: null });

    expect(cookieMocks.set).toHaveBeenCalledOnce();
    expect(cookieMocks.set).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      "new-access",
      ACCESS_COOKIE_OPTIONS,
    );
    expect(cookieMocks.remove).not.toHaveBeenCalled();
  });

  it("세션 종료 시 accessToken과 refreshToken 쿠키를 모두 삭제한다", async () => {
    await clearTokens();

    expect(cookieMocks.remove).toHaveBeenNthCalledWith(1, ACCESS_TOKEN_COOKIE);
    expect(cookieMocks.remove).toHaveBeenNthCalledWith(2, REFRESH_TOKEN_COOKIE);
  });
});
