import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `row/sort-option` — Design Library component set 318-14915, sync 2026-08-08.
// status=normal(318-14814) | selected(318-14916).

export interface RowSortOptionProps extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  label: string;
  selected?: boolean;
  /** selected일 때 표시할 Figma 20×20 check 아이콘. */
  checkIcon?: ReactNode;
}

export function RowSortOption({
  label,
  selected = false,
  checkIcon,
  className,
  type = "button",
  ...rest
}: RowSortOptionProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center border-b border-border-secondary bg-surface-primary py-4 text-left text-body-16-medium text-content-primary",
        selected && "gap-1",
        className,
      )}
      {...rest}
    >
      <span>{label}</span>
      {selected ? (
        <span
          aria-hidden="true"
          className="flex size-5 shrink-0 items-center justify-center text-content-brand-light"
        >
          {checkIcon}
        </span>
      ) : null}
    </button>
  );
}
