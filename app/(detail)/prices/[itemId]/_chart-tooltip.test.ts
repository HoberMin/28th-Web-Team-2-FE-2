import { describe, expect, it } from "vitest";
import { getChartTooltipPlacement } from "./_chart-tooltip";

describe("공공 시세 그래프 툴팁 위치", () => {
  it("포인트가 상단에 가까우면 halo 아래에 배치한다", () => {
    expect(getChartTooltipPlacement(20)).toEqual({ side: "below", top: 38 });
  });

  it("상단 공간이 충분하면 halo 위에 배치한다", () => {
    expect(getChartTooltipPlacement(100)).toEqual({ side: "above", top: 82 });
  });
});
