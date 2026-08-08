"use client";

import { useState } from "react";
import { ListSortOption } from "../../_components/list-sort-option";
import type { SortOption } from "../../_components/list-sort-option";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `list/sort-option` node 318-15246, sync 2026-08-08.

const OPTIONS: SortOption[] = [
  { value: "name", label: "가나다순" },
  { value: "cheap", label: "시세보다 저렴한 순" },
  { value: "recent", label: "최근 제보순" },
];

function ListSortOptionStory() {
  const [value, setValue] = useState("cheap");

  return (
    <div className="w-full max-w-89.5">
      <ListSortOption
        options={OPTIONS}
        value={value}
        onSelect={setValue}
        checkIcon={<FigmaIcon name="check" width={20} currentColor />}
      />
    </div>
  );
}

export const listSortOptionStory: Story = {
  id: "list-sort-option",
  title: "List Sort Option",
  group: "컴포넌트",
  figma: "node 318-15246",
  description: "정렬 기준 세 가지를 한 목록으로 묶어요.",
  Component: ListSortOptionStory,
};
