import { describe, expect, it } from "vitest";
import { getPriceTrendDirection } from "./_price-summary";

describe("가격 요약 등락 상태", () => {
  it("공공 시세가 없으면 변동 없음으로 단정하지 않는다", () => {
    expect(getPriceTrendDirection(null, 0)).toBeNull();
  });

  it("공공 시세가 있으면 차액 방향을 반환한다", () => {
    expect(getPriceTrendDirection(3000, -200)).toBe("down");
  });
});
