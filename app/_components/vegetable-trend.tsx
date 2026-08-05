import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `grid/vegetable-trend` — Design Library node 224-7405, sync 2026-08-05.
// Variant 축은 `lines`(1 line | 2 lines) 하나뿐이다.
//   1 line  → 16px 아이콘 + [금액][증감률]을 한 줄로
//   2 lines → 16px 아이콘 + [금액] / [증감률]을 두 줄로 (아이콘은 위쪽 정렬)
// 텍스트는 caption/12-medium, 색은 `trend/down`으로 **고정 바인딩**돼 있다.
//
// ⚠️ 방향(up/flat)은 Figma에 아직 변형이 없다. 토큰(`--color-trend-up`·`--color-trend-flat`)은
//    있지만 컴포넌트 규격이 down 하나뿐이라 임의로 축을 늘리지 않았다(임의 디자인 결정 금지).
//    디자이너가 방향 Variant를 추가하면 그때 prop으로 연다.
//
// ⚠️ 화살표 아이콘(16×16)은 Figma 안에서 이름 없는 벡터라 코드로 가져오지 못했다 —
//    에셋 바이트를 받으려면 figma.com URL을 내려받아야 하는데 레포 정책상 차단돼 있다
//    (figma-bridge §0-0). 그래서 `icon` 슬롯으로 열어 뒀다. text-field의 trailing 슬롯과 같은 처리다.
//
// ⚠️ 대비: trend/down(blue-600 #217cf9)은 흰 배경에서 3.95:1이라 12px 텍스트 기준(4.5:1)에
//    미달한다. Figma 원본 값을 그대로 유지하고 사실만 남긴다(figma-bridge §4).
//    방향이 색으로만 전달되지 않도록 아이콘에 의미를 담거나 호출부에서 대체 텍스트를 준다.

export type VegetableTrendLines = 1 | 2;

export interface VegetableTrendProps {
  /** 증감 금액 문자열 (포맷팅은 호출자 책임). 예: "100,000원" */
  amount: string;
  /** 증감률 문자열. 예: "(-7.4%)" */
  percent: string;
  lines?: VegetableTrendLines;
  /** Figma의 16×16 방향 아이콘 슬롯. 장식이 아니라 방향을 뜻하므로 라벨을 함께 주는 게 좋다. */
  icon?: ReactNode;
  className?: string;
}

export function VegetableTrend({
  amount,
  percent,
  lines = 2,
  icon,
  className,
}: VegetableTrendProps) {
  const oneLine = lines === 1;

  return (
    <div
      className={cn("flex w-full", oneLine ? "items-center" : "items-start", className)}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span>
      <span
        className={cn(
          "flex min-w-0 flex-1 whitespace-nowrap text-caption-12-medium text-trend-down",
          oneLine ? "items-center" : "flex-col items-start",
        )}
      >
        <span>{amount}</span>
        <span>{percent}</span>
      </span>
    </div>
  );
}
