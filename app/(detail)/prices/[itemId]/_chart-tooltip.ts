const POINT_HALO_RADIUS = 12;
const TOOLTIP_ARROW_HEIGHT = 6;
const TOOLTIP_ESTIMATED_HEIGHT = 50;

export interface ChartTooltipPlacement {
  side: "above" | "below";
  top: number;
}

/** 한 점뿐인 시계열도 "최신" 위치인 우측 끝에 두어 툴팁이 왼쪽 밖으로 잘리지 않게 한다. */
export function getChartPointX(index: number, pointCount: number, width: number): number {
  return pointCount <= 1 ? width : (index / (pointCount - 1)) * width;
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
