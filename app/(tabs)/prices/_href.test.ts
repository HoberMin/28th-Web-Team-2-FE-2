import { describe, expect, it } from "vitest";
import { buildPricesHref } from "./_href";

describe("buildPricesHref", () => {
  it("검색·그룹·정렬을 유지하며 다음 페이지 링크를 만든다", () => {
    expect(
      buildPricesHref({
        q: "감자",
        group: "감자·뿌리",
        sort: "price-asc",
        page: 2,
      }),
    ).toBe(
      "/prices?q=%EA%B0%90%EC%9E%90&group=%EA%B0%90%EC%9E%90%C2%B7%EB%BF%8C%EB%A6%AC&sort=price-asc&page=2",
    );
  });

  it("첫 페이지는 URL에서 생략한다", () => {
    expect(buildPricesHref({ page: 1 })).toBe("/prices");
  });
});
