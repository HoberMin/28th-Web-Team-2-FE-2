import { RowSortOption } from "../../_components/row-sort-option";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `row/sort-option` component set 318-14915, 재sync 2026-08-19 (state 축 2 → 4).

function CheckIcon() {
  return <FigmaIcon name="check" width={20} currentColor />;
}

// F00-2 온보딩 지역 목록이 켜는 `badge/current-location`(836-11892):
// surface/brand · radius/sm 4 · px-8 py-2 · caption/12-semibold · content/brand/medium.
function CurrentLocationBadge() {
  return (
    <span className="shrink-0 rounded-sm bg-surface-brand px-2 py-0.5 text-caption-12-semibold text-content-brand-medium">
      현재 위치
    </span>
  );
}

function RowSortOptionStory() {
  return (
    <div className="flex w-full max-w-89.5 flex-col gap-6">
      <div className="flex flex-col">
        <p className="pb-2 text-caption-12-semibold text-content-secondary">
          state=normal / selected — 높이 58 · py-16 + border-b border/secondary
        </p>
        <RowSortOption label="가나다순" />
        <RowSortOption label="시세보다 저렴한 순" selected checkIcon={<CheckIcon />} />
      </div>

      <div className="flex flex-col">
        <p className="pb-2 text-caption-12-semibold text-content-secondary">
          state=current / current-selected — 높이 49 · py-12 · 테두리 없음
        </p>
        <RowSortOption current label="천안시 서북구 성성동" badge={<CurrentLocationBadge />} />
        <RowSortOption
          current
          selected
          label="천안시 서북구 성성동"
          badge={<CurrentLocationBadge />}
          checkIcon={<CheckIcon />}
        />
        <RowSortOption current label="천안시 동남구 신방동" />
      </div>
    </div>
  );
}

export const rowSortOptionStory: Story = {
  id: "row-sort-option",
  title: "Row Sort Option",
  group: "컴포넌트",
  figma: "node 318-14915",
  description:
    "선택된 항목은 굵은 글씨 + 체크가 붙어요. current 계열(49)은 테두리가 없고 배지를 켤 수 있어요.",
  Component: RowSortOptionStory,
};
