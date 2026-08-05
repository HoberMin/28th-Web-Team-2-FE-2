import { VegetableTrend } from "../../_components/vegetable-trend";
import type { Story } from "./types";

// Figma `grid/vegetable-trend` node 224-7405, sync 2026-08-05.
// Variant는 lines(1 line | 2 lines) 하나. 예시 문자열도 Figma 원본 그대로 썼다.
//
// 화살표 아이콘(16×16)은 Figma 에셋을 코드로 가져오지 못해(figma-bridge §0-0) 슬롯으로 비워 뒀다.
// 스토리에서는 자리만 점선으로 표시한다 — 임의 아이콘을 그려 넣지 않는다.

function IconSlot() {
  return <span className="block size-4 rounded-sm border border-border-primary border-dashed" />;
}

const CASES = [
  { lines: 2, amount: "100,000000원", label: "lines=2 lines" },
  { lines: 1, amount: "100,000원", label: "lines=1 line" },
] as const;

function VegetableTrendStory() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-caption-12-regular text-content-secondary">
        Figma 규격: caption/12-medium + <strong>trend/down</strong> 색 고정. 아래 칸 너비는 Figma
        격자 한 칸(111px)에 맞췄어요. 점선 네모는 아직 못 가져온 화살표 아이콘 자리예요.
      </p>

      <div className="flex flex-wrap gap-6">
        {CASES.map(({ lines, amount, label }) => (
          <div key={label} className="flex flex-col gap-2">
            <div className="w-28 rounded-md border border-border-primary px-2 py-2">
              <VegetableTrend
                amount={amount}
                percent="(-7.4%)"
                lines={lines}
                icon={<IconSlot />}
              />
            </div>
            <p className="text-caption-12-regular text-content-secondary">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-md bg-surface-secondary px-4 py-3">
        <p className="text-body-14-semibold text-content-primary">디자이너 확인이 필요한 것</p>
        <ul className="flex list-disc flex-col gap-1 pl-4 text-caption-12-regular text-content-secondary">
          <li>
            <strong>방향이 &ldquo;하락&rdquo; 하나뿐이에요.</strong> Figma 컴포넌트가 색을
            trend/down에 고정 바인딩해 뒀고 상승·보합 변형이 없어서, 코드에도 방향 축을 만들지
            않았어요. 토큰(trend/up·trend/flat)은 이미 있으니 Figma에 변형만 추가되면 바로 열 수
            있어요.
          </li>
          <li>
            <strong>대비 3.95:1</strong> — 12px 텍스트 기준(4.5:1)에 못 미쳐요. Figma 원본
            값(trend/down = blue-600)을 그대로 뒀으니, 한 단계 진한 파랑으로 갈지 봐주세요.
          </li>
          <li>
            상승/하락이 색으로만 구분되면 색각 이상 사용자가 놓쳐요. 화살표 아이콘이 방향을 같이
            말해주도록 만들어 주세요.
          </li>
        </ul>
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
