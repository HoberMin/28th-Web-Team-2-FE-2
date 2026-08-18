import { describe, expect, it } from "vitest";
import { createFavoriteState, reduceFavoriteState } from "./_favorite-state";

describe("favorite state", () => {
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
