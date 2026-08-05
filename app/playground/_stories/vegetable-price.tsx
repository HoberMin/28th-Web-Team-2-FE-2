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
      <p className="text-caption-12-regular text-content-secondary">
        Figma 규격: 값은 body/16-bold 또는 body/14-bold(content/primary), 단위는
        caption/12-regular(content/disabled). 아래 칸 너비는 Figma 격자 한 칸(111px)에 맞춰
        말줄임이 어떻게 걸리는지 보여주려고 고정했어요.
      </p>

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

      <div className="flex flex-col gap-2 rounded-md bg-surface-secondary px-4 py-3">
        <p className="text-body-14-semibold text-content-primary">알아두면 좋은 것</p>
        <ul className="flex list-disc flex-col gap-1 pl-4 text-caption-12-regular text-content-secondary">
          <li>
            <strong>1 line</strong>은 값과 단위를 가로로 붙이고, 값이 길면 72px에서 말줄임(…)이
            생겨요. <strong>2 lines</strong>는 세로로 쌓고 값이 길면 줄바꿈돼요.
          </li>
          <li>
            단위(/100kg) 대비가 흰 배경에서 1.92:1이라 많이 흐려요(기준 4.5:1). Figma 원본
            값(content/disabled)을 그대로 뒀으니 한 단계 진하게 갈지 봐주세요.
          </li>
          <li>가격 문자열 포맷(쉼표·원)은 이 컴포넌트가 아니라 화면 쪽에서 만들어 넣어요.</li>
        </ul>
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
