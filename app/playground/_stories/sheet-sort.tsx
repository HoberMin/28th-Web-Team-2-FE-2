"use client";

import { useState } from "react";
import { SheetSort, SheetSortPanel } from "../../_components/sheet-sort";
import type { SheetSortOption } from "../../_components/sheet-sort";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `sheet/sort` — 화면GUI F02 정렬시트(298-3546)의 인스턴스 298-3575, sync 2026-08-08.
//
// 체크 아이콘은 Figma 원본 SVG(`public/figma/design-library/icons/check.svg`)를 쓴다 —
// 임시 도형은 걷어냈다. 선택 행이 아이콘 색(content/brand/light)을 정하므로 currentColor로 넘긴다.

function CheckIcon() {
  return <FigmaIcon name="check" width={20} currentColor />;
}

const OPTIONS: SheetSortOption[] = [
  { value: "name", label: "가나다순" },
  { value: "cheap", label: "시세보다 저렴한 순" },
  { value: "recent", label: "최근 제보순" },
];

function SheetSortStory() {
  const [panelValue, setPanelValue] = useState("name");
  const [rowValue, setRowValue] = useState("selected");
  const [dialogValue, setDialogValue] = useState("cheap");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">시트 전체</p>
        <p className="text-caption-12-regular text-content-secondary">
          눌러서 선택을 바꿔 볼 수 있어요.
        </p>
        <SheetSortPanel
          options={OPTIONS}
          value={panelValue}
          onSelect={setPanelValue}
          checkIcon={<CheckIcon />}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">행 두 가지 모습</p>
        <p className="text-caption-12-regular text-content-secondary">
          위가 선택된 행, 아래가 선택되지 않은 행이에요.
        </p>
        <SheetSortPanel
          title="정렬"
          options={[
            { value: "selected", label: "시세보다 저렴한 순" },
            { value: "normal", label: "최근 제보순" },
          ]}
          value={rowValue}
          onSelect={setRowValue}
          checkIcon={<CheckIcon />}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">실제로 올라오는 모습</p>
        <p className="text-caption-12-regular text-content-secondary">
          화면을 덮고 아래에서 올라와요. 바깥을 누르거나 Esc를 누르면 닫히고, 옵션을 고르면 바로
          닫혀요.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg bg-action-tertiary-default px-4 py-2 text-body-14-medium text-content-primary"
        >
          정렬 시트 열기
        </button>
        <SheetSort
          open={open}
          onOpenChange={setOpen}
          options={OPTIONS}
          value={dialogValue}
          onSelect={(next) => {
            setDialogValue(next);
            setOpen(false);
          }}
          checkIcon={<CheckIcon />}
        />
      </div>
    </div>
  );
}

export const sheetSortStory: Story = {
  id: "sheet-sort",
  title: "Sheet Sort",
  group: "패턴",
  figma: "node 298-3575",
  description: "야채 시세 화면에서 아래로부터 올라오는 정렬 선택 시트예요.",
  Component: SheetSortStory,
};
