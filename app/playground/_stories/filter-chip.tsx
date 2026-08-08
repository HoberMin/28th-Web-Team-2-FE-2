import { FilterChip } from "../../_components/filter-chip";
import type { Story } from "./types";

// Figma `filter/chip` node 237-10450, sync 2026-08-05. Property 1 = normal | selected.

function FilterChipStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-body-14-semibold text-content-primary">selected</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="전체" count={46} selected />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-body-14-semibold text-content-primary">normal</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="감자·뿌리" count={5} selected={false} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-body-14-semibold text-content-primary">여러 개를 나란히 놓으면</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="전체" count={46} selected />
            <FilterChip label="감자·뿌리" count={5} selected={false} />
            <FilterChip label="잎채소" count={12} selected={false} />
            <FilterChip label="열매채소" count={9} selected={false} />
          </div>
        </div>
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
