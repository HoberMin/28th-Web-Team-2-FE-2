const POINT_HALO_RADIUS = 12;
const TOOLTIP_ARROW_HEIGHT = 6;
const TOOLTIP_ESTIMATED_HEIGHT = 50;

export interface ChartTooltipPlacement {
  side: "above" | "below";
  top: number;
}

/** 상단 공간이 부족하면 툴팁을 포인트 아래로 내려 halo와 겹치지 않게 한다. */
export function getChartTooltipPlacement(pointY: number): ChartTooltipPlacement {
  const anchorGap = POINT_HALO_RADIUS + TOOLTIP_ARROW_HEIGHT;
  const aboveAnchor = pointY - anchorGap;

  if (aboveAnchor >= TOOLTIP_ESTIMATED_HEIGHT) {
    return { side: "above", top: aboveAnchor };
  }

  return { side: "below", top: pointY + anchorGap };
}
