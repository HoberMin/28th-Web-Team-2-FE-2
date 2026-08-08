import { VegetableTrend } from "../../_components/vegetable-trend";
import { FigmaIcon } from "./figma-asset";
import type { Story } from "./types";

// Figma `grid/vegetable-trend` node 224-7405, sync 2026-08-05.
// Variant는 lines(1 line | 2 lines) 하나. 예시 문자열도 Figma 원본 그대로 썼다.
//
const CASES = [
  { lines: 2, amount: "100,000000원", label: "lines=2 lines" },
  { lines: 1, amount: "100,000원", label: "lines=1 line" },
] as const;

function VegetableTrendStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-6">
        {CASES.map(({ lines, amount, label }) => (
          <div key={label} className="flex flex-col gap-2">
            <div className="w-28 rounded-md border border-border-primary px-2 py-2">
              <VegetableTrend
                amount={amount}
                percent="(-7.4%)"
                lines={lines}
                icon={<FigmaIcon name="trend-down" width={16} />}
              />
            </div>
            <p className="text-caption-12-regular text-content-secondary">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const vegetableTrendStory: Story = {
  id: "vegetable-trend",
  title: "Vegetable Trend",
  group: "컴포넌트",
  figma: "node 224-7405",
  description: "야채 격자 칸의 가격 증감 표시예요. 한 줄 배치와 두 줄 배치 2가지.",
  Component: VegetableTrendStory,
};
