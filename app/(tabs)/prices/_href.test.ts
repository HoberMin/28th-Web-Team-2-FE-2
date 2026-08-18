import { describe, expect, it } from "vitest";
import { buildPricesHref } from "./_href";

describe("buildPricesHref", () => {
  it("검색·그룹·정렬을 URL에 유지한다", () => {
    expect(
      buildPricesHref({
        q: "감자",
        group: "감자·뿌리",
        sort: "price-asc",
      }),
    ).toBe(
      "/prices?q=%EA%B0%90%EC%9E%90&group=%EA%B0%90%EC%9E%90%C2%B7%EB%BF%8C%EB%A6%AC&sort=price-asc",
    );
  });

  it("조건이 없으면 기본 시세 경로를 만든다", () => {
    expect(buildPricesHref({})).toBe("/prices");
  });
});
