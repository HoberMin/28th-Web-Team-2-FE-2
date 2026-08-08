import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../_lib/cn";

// Figma `filter/chip` — Design Library node 237-10450, sync 2026-08-05.
// Property 1 = normal | selected. 라벨 + 개수 두 텍스트로 이뤄진다.
//
// 필터 토글이라 네이티브 `<button>` + `aria-pressed`로 만든다 —
// 선택 여부가 색에만 의존하지 않고 보조기술에도 전달돼야 한다.
// Figma에 pressed·disabled 상태가 없어 만들지 않았다.

const BASE =
  "inline-flex items-center justify-center gap-1 rounded-full px-4 py-2 text-body-14-medium";

const TONE = {
  normal: "bg-action-tertiary-default text-content-primary",
  selected: "bg-action-secondary-default text-content-inverse",
} as const;

export interface FilterChipProps extends ComponentPropsWithoutRef<"button"> {
  label: string;
  /** 해당 필터에 걸리는 항목 수. Figma 두 변형 모두 개수를 함께 보여준다. */
  count?: number;
  selected?: boolean;
}

export function FilterChip({
  label,
  count,
  selected = true,
  className,
  type = "button",
  ...rest
}: FilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(BASE, TONE[selected ? "selected" : "normal"], className)}
      {...rest}
    >
      <span>{label}</span>
      {count === undefined ? null : <span className="tabular-nums">{count}</span>}
    </button>
  );
}
