import { RowSortOption } from "../../_components/row-sort-option";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `row/sort-option` component set 318-14915, sync 2026-08-08.

function CheckIcon() {
  return <FigmaIcon name="check" width={20} currentColor />;
}

function RowSortOptionStory() {
  return (
    <div className="flex w-full max-w-89.5 flex-col">
      <RowSortOption label="가나다순" />
      <RowSortOption label="시세보다 저렴한 순" selected checkIcon={<CheckIcon />} />
    </div>
  );
}

export const rowSortOptionStory: Story = {
  id: "row-sort-option",
  title: "Row Sort Option",
  group: "컴포넌트",
  figma: "node 318-14915",
  description: "정렬 기준 한 가지를 보여 주며 선택되면 체크가 붙어요.",
  Component: RowSortOptionStory,
};
