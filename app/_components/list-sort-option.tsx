import type { ReactNode } from "react";
import { cn } from "../_lib/cn";
import { RowSortOption } from "./row-sort-option";

// Figma `list/sort-option` — Design Library node 318-15246, sync 2026-08-08.
// row/sort-option 3개를 gap 없이 세로로 쌓는다. 원본은 마지막 행에도 border-bottom이 있다.

export interface SortOption {
  value: string;
  label: string;
}

export interface ListSortOptionProps {
  options: readonly SortOption[];
  value: string;
  onSelect: (value: string) => void;
  checkIcon?: ReactNode;
  className?: string;
}

export function ListSortOption({
  options,
  value,
  onSelect,
  checkIcon,
  className,
}: ListSortOptionProps) {
  return (
    <div className={cn("flex w-full flex-col items-start", className)}>
      {options.map((option) => (
        <RowSortOption
          key={option.value}
          label={option.label}
          selected={option.value === value}
          onClick={() => onSelect(option.value)}
          checkIcon={checkIcon}
        />
      ))}
    </div>
  );
}
