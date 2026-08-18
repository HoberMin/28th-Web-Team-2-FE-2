import { describe, expect, it } from "vitest";
import {
  ACCESS_COOKIE_OPTIONS,
  BACKOFF_COOKIE_OPTIONS,
  extractRefreshToken,
  needsRefresh,
  readTokenExpiry,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_LEEWAY_SECONDS,
} from "./tokens";

function tokenWithPayload(payload: unknown): string {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `header.${encoded}.signature`;
}

describe("auth tokens", () => {
  it("base64url JWT payload의 exp를 읽는다", () => {
    expect(readTokenExpiry(tokenWithPayload({ exp: 1_900_000_000 }))).toBe(1_900_000_000);
  });

  it.each([
    ["payload가 없는 토큰", "not-a-jwt"],
    ["base64가 아닌 payload", "header.%%%.signature"],
    ["객체가 아닌 payload", tokenWithPayload("payload")],
    ["숫자 exp가 없는 payload", tokenWithPayload({ exp: "1900000000" })],
  ])("%s의 만료 시각을 신뢰하지 않는다", (_case, token) => {
    expect(readTokenExpiry(token)).toBeNull();
  });

  it("만료 여유 시간 경계부터 재발급 대상으로 본다", () => {
    const now = 1_900_000_000;

    expect(needsRefresh(tokenWithPayload({ exp: now + REFRESH_LEEWAY_SECONDS + 1 }), now)).toBe(
      false,
    );
    expect(needsRefresh(tokenWithPayload({ exp: now + REFRESH_LEEWAY_SECONDS }), now)).toBe(true);
    expect(needsRefresh(tokenWithPayload({ exp: now - 1 }), now)).toBe(true);
  });

  it("토큰이 없거나 해석할 수 없으면 재발급 대상으로 본다", () => {
    expect(needsRefresh(undefined, 1_900_000_000)).toBe(true);
    expect(needsRefresh("invalid", 1_900_000_000)).toBe(true);
  });

  it("여러 Set-Cookie 중 Spring refreshToken 값만 추출한다", () => {
    expect(
      extractRefreshToken([
        "tracking=abc; Path=/",
        "refreshToken=refresh.jwt.value; Path=/; HttpOnly; SameSite=Lax",
      ]),
    ).toBe("refresh.jwt.value");
  });

  it.each([
    ["대상 쿠키 없음", ["session=value; Path=/"]],
    ["빈 refreshToken", ["refreshToken=; Path=/; HttpOnly"]],
    ["구분자 없는 헤더", ["refreshToken"]],
  ])("%s이면 refreshToken이 없다고 판정한다", (_case, headers) => {
    expect(extractRefreshToken(headers)).toBeNull();
  });

  it("세션 쿠키에 HttpOnly·SameSite·path와 수명을 고정한다", () => {
    expect(ACCESS_COOKIE_OPTIONS).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    expect(REFRESH_COOKIE_OPTIONS).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    expect(BACKOFF_COOKIE_OPTIONS).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60,
    });
  });
});
