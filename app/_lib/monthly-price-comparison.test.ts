import { describe, expect, it } from "vitest";
import { compareWithOneMonthAgo } from "./monthly-price-comparison";

describe("compareWithOneMonthAgo", () => {
  it("기준일과 한 달 전의 가장 가까운 이전 수집일을 비교한다", () => {
    expect(
      compareWithOneMonthAgo([
        { date: "2026-07-20", price: 3000 },
        { date: "2026-08-20", price: 3300 },
      ]),
    ).toEqual({ diff: 300, percent: 10 });

    expect(
      compareWithOneMonthAgo([
        { date: "2026-07-19", price: 3000 },
        { date: "2026-08-20", price: 3300 },
      ]),
    ).toEqual({ diff: 300, percent: 10 });
  });

  it("비교 가격이 없거나 0원이면 비교하지 않는다", () => {
    expect(compareWithOneMonthAgo([{ date: "2026-08-20", price: 3300 }])).toBeNull();
    expect(
      compareWithOneMonthAgo([
        { date: "2026-07-20", price: 0 },
        { date: "2026-08-20", price: 3300 },
      ]),
    ).toBeNull();
  });

  it("월말 기준일은 비교 월의 마지막 날짜로 보정한다", () => {
    expect(
      compareWithOneMonthAgo([
        { date: "2026-02-28", price: 3000 },
        { date: "2026-03-31", price: 3300 },
      ]),
    ).toEqual({ diff: 300, percent: 10 });
  });
});
