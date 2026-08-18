import { describe, expect, it } from "vitest";
import { createFavoriteState, reduceFavoriteState } from "./_favorite-state";

describe("favorite state", () => {
  it("서버 찜 정본이 바뀌면 대기 중이 아닐 때 로컬 상태를 맞춘다", () => {
    expect(
      reduceFavoriteState(createFavoriteState(false), { type: "hydrate", liked: true }),
    ).toEqual(createFavoriteState(true));
  });

  it("낙관적 요청 중에는 이전 서버 정본으로 로컬 상태를 덮지 않는다", () => {
    const pending = reduceFavoriteState(createFavoriteState(false), {
      type: "request",
      liked: true,
    });

    expect(reduceFavoriteState(pending, { type: "hydrate", liked: false })).toBe(pending);
  });

  it("요청 중 같은 품목의 중복 토글을 무시한다", () => {
    const pending = reduceFavoriteState(createFavoriteState(false), {
      type: "request",
      liked: true,
    });

    expect(reduceFavoriteState(pending, { type: "request", liked: false })).toBe(pending);
  });

  it.each(["로그인이 필요해요.", "찜 상태를 바꾸지 못했어요."])(
    "실패하면 낙관적으로 바꾼 찜 상태를 되돌린다: %s",
    (message) => {
      const pending = reduceFavoriteState(createFavoriteState(false), {
        type: "request",
        liked: true,
      });

      expect(reduceFavoriteState(pending, { type: "failure", message })).toEqual({
        liked: false,
        previousLiked: false,
        pending: false,
        message,
      });
    },
  );
});
