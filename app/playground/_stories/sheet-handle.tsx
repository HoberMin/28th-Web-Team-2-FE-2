import { SheetHandle } from "../../_components/sheet-handle";
import type { Story } from "./types";

// Figma `sheet/handle` node 318-15226, sync 2026-08-08.

function SheetHandleStory() {
  return (
    <div className="flex w-full justify-center rounded-t-3xl bg-surface-primary p-4">
      <SheetHandle />
    </div>
  );
}

export const sheetHandleStory: Story = {
  id: "sheet-handle",
  title: "Sheet Handle",
  group: "컴포넌트",
  figma: "node 318-15226",
  description: "아래 시트의 위쪽에서 잡는 위치를 알려 주는 표시예요.",
  Component: SheetHandleStory,
};
