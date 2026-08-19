import { describe, expect, it } from "vitest";
import { buildPricesHref } from "./_href";

describe("buildPricesHref", () => {
  it("검색·그룹·정렬을 URL에 유지한다", () => {
    expect(
      buildPricesHref({
        q: "감자",
        group: "뿌리채소",
        sort: "price-asc",
      }),
    ).toBe(
      "/prices?q=%EA%B0%90%EC%9E%90&group=%EB%BF%8C%EB%A6%AC%EC%B1%84%EC%86%8C&sort=price-asc",
    );
  });

  it("조건이 없으면 기본 시세 경로를 만든다", () => {
    expect(buildPricesHref({})).toBe("/prices");
  });
});
