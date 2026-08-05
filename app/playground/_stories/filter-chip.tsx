import { FilterChip } from "../../_components/filter-chip";
import type { Story } from "./types";

// Figma `filter/chip` node 237-10450, sync 2026-08-05. Property 1 = normal | selected.

function FilterChipStory() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-caption-12-regular text-content-secondary">
        Figma 규격: 좌우 여백 16px · 위아래 8px · 라벨과 개수 간격 4px · radius/full ·
        body/14-medium.
      </p>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-body-14-semibold text-content-primary">selected</p>
          <p className="text-caption-12-regular text-content-secondary">
            배경 action-secondary/default · 글자 content/inverse
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="전체" count={46} selected />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-body-14-semibold text-content-primary">normal</p>
          <p className="text-caption-12-regular text-content-secondary">
            배경 action-tertiary/default · 글자 content/primary
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="감자·뿌리" count={5} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-body-14-semibold text-content-primary">여러 개를 나란히 놓으면</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="전체" count={46} selected />
            <FilterChip label="감자·뿌리" count={5} />
            <FilterChip label="잎채소" count={12} />
            <FilterChip label="열매채소" count={9} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-md bg-surface-secondary px-4 py-3">
        <p className="text-body-14-semibold text-content-primary">알아두면 좋은 것</p>
        <ul className="flex list-disc flex-col gap-1 pl-4 text-caption-12-regular text-content-secondary">
          <li>
            선택 여부를 색뿐 아니라 <code>aria-pressed</code>로도 알려요. 화면을 못 보고 쓰는
            분에게도 &ldquo;눌린 상태&rdquo;가 전달됩니다.
          </li>
          <li>누르는 중(pressed)·못 누르는(disabled) 모습은 Figma에 없어서 만들지 않았어요.</li>
          <li>대비는 selected 12.85:1, normal 12.19:1로 둘 다 충분해요.</li>
        </ul>
      </div>
    </div>
  );
}

export const filterChipStory: Story = {
  id: "filter-chip",
  title: "Filter Chip",
  group: "컴포넌트",
  figma: "node 237-10450",
  description: "목록을 분류별로 걸러낼 때 쓰는 알약 모양 버튼이에요. 이름과 개수를 같이 보여줘요.",
  Component: FilterChipStory,
};
