import { VegetablePrice } from "../../_components/vegetable-price";
import type { Story } from "./types";

// Figma `grid/vegetable-price` node 224-7408, sync 2026-08-05.
// price(14pt|16pt) × lines(1 line|2 lines) = 4종. 예시 문자열도 Figma 원본 그대로 썼다.

const CASES = [
  { size: "16", lines: 2, value: "249,090,000원", label: "price=16pt, lines=2 lines" },
  { size: "16", lines: 1, value: "24,900원", label: "price=16pt, lines=1 line" },
  { size: "14", lines: 2, value: "249,090,000원", label: "price=14pt, lines=2 lines" },
  { size: "14", lines: 1, value: "24,9090원", label: "price=14pt, lines=1 line" },
] as const;

function VegetablePriceStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-6">
        {CASES.map(({ size, lines, value, label }) => (
          <div key={label} className="flex flex-col gap-2">
            <div className="w-28 rounded-md border border-border-primary px-2 py-2">
              <VegetablePrice value={value} unit="/100kg" size={size} lines={lines} />
            </div>
            <p className="text-caption-12-regular text-content-secondary">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const vegetablePriceStory: Story = {
  id: "vegetable-price",
  title: "Vegetable Price",
  group: "컴포넌트",
  figma: "node 224-7408",
  description: "야채 격자 칸에 들어가는 가격 표시예요. 글자 크기 2가지 × 배치 2가지.",
  Component: VegetablePriceStory,
};
