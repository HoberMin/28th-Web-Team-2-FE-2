"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../_lib/cn";
import type { SortOption } from "./list-sort-option";
import { ListSortOption } from "./list-sort-option";
import { SheetHandle } from "./sheet-handle";

// Figma `sheet/sort` — Design Library node 318-15278, sync 2026-08-08.
// 390px 모바일 프레임에서 px-4 · pt-2 · pb-8 · gap-4 · rounded-t-3xl.
// 높이는 옵션 3개일 때 270px이며 그림자는 없다.
// 실제 화면 동작은 네이티브 dialog가 담당하고, SheetSortPanel이 Figma 표면을 그대로 그린다.

export interface SheetSortPanelProps {
  title?: string;
  options: readonly SortOption[];
  value: string;
  onSelect: (value: string) => void;
  checkIcon?: ReactNode;
  titleId?: string;
  className?: string;
}

export function SheetSortPanel({
  title = "정렬",
  options,
  value,
  onSelect,
  checkIcon,
  titleId,
  className,
}: SheetSortPanelProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-4 rounded-t-3xl bg-surface-primary px-4 pt-2 pb-8",
        className,
      )}
    >
      <SheetHandle />
      <div className="flex w-full flex-col items-start gap-2">
        <p id={titleId} className="text-title-18-semibold text-content-primary">
          {title}
        </p>
        <ListSortOption
          options={options}
          value={value}
          onSelect={onSelect}
          checkIcon={checkIcon}
        />
      </div>
    </div>
  );
}

export interface SheetSortProps extends Omit<SheetSortPanelProps, "titleId" | "className"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SheetSort({ open, onOpenChange, ...panel }: SheetSortProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current) onOpenChange(false);
      }}
      className="mx-0 mt-auto mb-0 w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-overlay-dim"
    >
      <SheetSortPanel {...panel} titleId={titleId} />
    </dialog>
  );
}
