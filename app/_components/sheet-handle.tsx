import { cn } from "../_lib/cn";

// Figma `sheet/handle` — Design Library node 318-15226, sync 2026-08-08.
// 40×4 · radius/full · surface/secondary.

export interface SheetHandleProps {
  className?: string;
}

export function SheetHandle({ className }: SheetHandleProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("block h-1 w-10 shrink-0 rounded-full bg-surface-secondary", className)}
    />
  );
}
