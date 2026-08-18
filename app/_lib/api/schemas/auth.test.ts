import { describe, expect, it } from "vitest";
import { loginRequestSchema, MAX_KAKAO_ID_TOKEN_LENGTH } from "./auth";

describe("auth schemas", () => {
  it("카카오 idToken 문자열을 허용한다", () => {
    expect(loginRequestSchema.parse({ idToken: "header.payload.signature" })).toEqual({
      idToken: "header.payload.signature",
    });
  });

  it.each([
    ["빈 문자열", ""],
    ["공백 문자열", "   "],
    ["최대 길이 초과", "a".repeat(MAX_KAKAO_ID_TOKEN_LENGTH + 1)],
  ])("%s idToken을 거부한다", (_case, idToken) => {
    expect(loginRequestSchema.safeParse({ idToken }).success).toBe(false);
  });

  it("최대 길이의 idToken은 허용한다", () => {
    const idToken = "a".repeat(MAX_KAKAO_ID_TOKEN_LENGTH);

    expect(loginRequestSchema.safeParse({ idToken }).success).toBe(true);
  });
});
