import {
  VegetableTrend,
  type VegetableTrendLines,
  type VegetableTrendState,
} from "../../_components/vegetable-trend";
import { FigmaIcon } from "./figma-asset";
import type { Story } from "./types";

// Figma `text/vegetable-trend` node 477-5291 (구 `grid/vegetable-trend` 224-7405).
// **재sync 2026-08-08: state 축(down·up·flat)이 생겨 반영했다.**
//
// Figma 심볼은 5개다 — lines=1 × down·up·flat / lines=2 × down·up.
// **lines=2 × flat 심볼은 없다**(flat은 값 텍스트 자체가 없어 줄 수 개념이 성립하지 않는다).
// 없는 조합을 지어내지 않으려고 아래 목록도 5개만 둔다.
//
// 화살표·막대 아이콘(16×16)은 Figma에 `icon/trend-down·up·flat`로 정식 등록돼 있고
// (477-9119·9120·9121) 원본 SVG를 `public/figma/design-library/icons/trend-*.svg`로 받아 뒀다.
// state별로 그 원본을 그대로 꽂는다 — 임시 점선 자리표시는 걷어냈다.
// 색은 아이콘 원본이 들고 있으므로 currentColor로 덮지 않는다.

const CASES: {
  lines: VegetableTrendLines;
  state: VegetableTrendState;
  amount?: string;
  label: string;
}[] = [
  { lines: 2, state: "down", amount: "100,000000원", label: "2줄 · 내림(down)" },
  { lines: 2, state: "up", amount: "100,000000원", label: "2줄 · 오름(up)" },
  { lines: 1, state: "down", amount: "100,000원", label: "1줄 · 내림(down)" },
  { lines: 1, state: "up", amount: "100,000원", label: "1줄 · 오름(up)" },
  { lines: 1, state: "flat", label: "1줄 · 변동없음(flat)" },
];

function VegetableTrendStory() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-caption-12-regular text-content-secondary">
        방향 아이콘은 Figma 원본 그대로예요. 변동없음(flat)은 디자인상 금액·비율 글자가 없고
        아이콘만 있어요.
      </p>

      <div className="flex flex-wrap gap-6">
        {CASES.map(({ lines, state, amount, label }) => (
          <div key={label} className="flex flex-col gap-2">
            <div className="w-28 rounded-md border border-border-primary px-2 py-2">
              <VegetableTrend
                amount={amount}
                percent={state === "flat" ? undefined : "(-7.4%)"}
                state={state}
                lines={lines}
                icon={<FigmaIcon name={`trend-${state}`} width={16} />}
              />
            </div>
            <p className="text-caption-12-regular text-content-secondary">{label}</p>
          </div>
        ))}
      </div>

      <p className="text-caption-12-regular text-content-secondary">
        색은 내림 파랑(#217cf9) · 오름 빨강(#ed2c42) · 변동없음 회색(#b4bbcb)이에요. 셋 다 12px
        글자 기준 대비가 모자라요 (3.95 · 4.15 · 1.95 : 1, 기준 4.5:1) — 디자인 원본 값 그대로예요.
      </p>
    </div>
  );
}

export const vegetableTrendStory: Story = {
  id: "vegetable-trend",
  title: "Vegetable Trend",
  group: "컴포넌트",
  figma: "node 477-5291",
  description: "야채 가격 증감 표시예요. 오름·내림·변동없음 3가지 × 줄 배치 2가지.",
  Component: VegetableTrendStory,
};
