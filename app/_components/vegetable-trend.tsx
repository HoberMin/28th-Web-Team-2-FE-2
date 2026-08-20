import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `text/vegetable-trend` — Design Library node 477-5291 (구 `grid/vegetable-trend` 224-7405).
// **재sync 2026-08-08: `state` 축(down·up·flat)이 생겨 반영했다.**
//
// Variant 축 2개 = lines(1 | 2) × state(down | up | flat) — Figma 심볼은 **5개**다:
//   lines=1 × down · up · flat        (477-5292 · 5297 · 5302)
//   lines=2 × down · up               (477-5307 · 5312)
//   ⚠️ **lines=2 × flat 심볼은 없다.** flat은 애초에 표시할 값이 없어서(아래 참고) 줄 수 개념이
//      성립하지 않는다. 그래서 코드도 state="flat"이면 lines를 무시한다 — 없는 조합을 지어내지 않는다.
//
// 배치:
//   1 line  → 16px 아이콘 + [금액][증감률]을 한 줄로 (컨테이너 items-center)
//   2 lines → 16px 아이콘 + [금액] / [증감률]을 두 줄로 (컨테이너 items-start)
//   flat    → **아이콘만.** Figma의 flat 심볼에는 금액·증감률 텍스트 노드가 아예 없다.
//             변동 없음을 가로 막대 하나로만 표현한다.
//
// 값 span은 flex-grow를 주지 않는다 — 주면 짧은 값(퍼센트만 있는 경우 등)도 항상 부모 폭까지
// 늘어나 버려서, 우측 정렬 호출부(`ListLowestVegetable`)가 `justify-end`를 줘도 아이콘+텍스트
// 묶음이 왼쪽에 붙은 채로 보인다.
//
// 색 (get_variable_defs로 확인 — 세 값 모두 이 노드에 바인딩돼 있다):
//   down → trend/down  #217cf9 (blue-600)
//   up   → trend/up    #ed2c42 (red-600)
//   flat → trend/flat  #b4bbcb (gray-400) ← 아이콘에만 걸린다
//
// 화살표·막대 아이콘(16×16)은 `icon/trend-down`·`icon/trend-up`·`icon/trend-flat` 3종으로
//    **정식 등록됐고**(477-9119·9120·9121) 원본 SVG는
//    `public/figma/design-library/icons/trend-*.svg`에 있다. 컴포넌트는 state별 분기를 들지 않고
//    `icon` 슬롯으로 받는다 — 호출부가 state에 맞는 원본을 꽂는다(`/playground` 스토리 참고).
//    → 이로써 "방향을 색으로만 전달"하던 WCAG 1.4.1 문제는 해소됐다. 다만 아이콘을 넘기지 않으면
//      화면상 색만 남으므로, 그 경우엔 호출부가 대체 텍스트를 주는 게 안전하다.
//
// ⚠️ 대비 (전부 12px 텍스트 기준 4.5:1 미달 — Figma 원본 유지 + 사실만 기록, figma-bridge §4):
//    trend/down on 흰 배경 3.95:1 · trend/up on 흰 배경 4.15:1 · trend/flat on 흰 배경 1.95:1
//    (flat은 아이콘 전용이라 아이콘 기준 3:1로 봐도 미달이다.)

export type VegetableTrendLines = 1 | 2;
export type VegetableTrendState = "down" | "up" | "flat";

/** Figma의 state 축 → 색 토큰. flat은 텍스트가 없어 아이콘 슬롯에만 적용된다. */
const STATE_COLOR: Record<VegetableTrendState, string> = {
  down: "text-trend-down",
  up: "text-trend-up",
  flat: "text-trend-flat",
};

export interface VegetableTrendProps {
  /** 증감 금액 문자열 (포맷팅은 호출자 책임). 예: "100,000원". state="flat"이면 표시되지 않는다. */
  amount?: string;
  /** 증감률 문자열. 예: "(-7.4%)". state="flat"이면 표시되지 않는다. */
  percent?: string;
  /** Figma의 state 축. 기본값은 심볼 기본인 `down`. */
  state?: VegetableTrendState;
  /** Figma의 lines 축. state="flat"에서는 무시된다(해당 심볼이 없다). */
  lines?: VegetableTrendLines;
  /** Figma의 16×16 방향 아이콘 슬롯. 장식이 아니라 방향을 뜻하므로 라벨을 함께 주는 게 좋다. */
  icon?: ReactNode;
  className?: string;
}

export function VegetableTrend({
  amount,
  percent,
  state = "down",
  lines = 2,
  icon,
  className,
}: VegetableTrendProps) {
  const isFlat = state === "flat";
  // flat 심볼은 값 텍스트 자체가 없다 — lines 축도 함께 무의미해진다.
  const oneLine = isFlat || lines === 1;

  return (
    <div
      className={cn(
        "flex w-full",
        STATE_COLOR[state],
        oneLine ? "items-center" : "items-start",
        className,
      )}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span>
      {isFlat ? null : (
        <span
          className={cn(
            "flex min-w-0 whitespace-nowrap text-caption-12-medium",
            oneLine ? "items-center" : "flex-col items-start",
          )}
        >
          <span>{amount}</span>
          <span>{percent}</span>
        </span>
      )}
    </div>
  );
}
