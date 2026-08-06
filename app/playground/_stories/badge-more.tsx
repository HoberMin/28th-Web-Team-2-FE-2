import { BadgeMore } from "../../_components/badge-more";
import type { Story } from "./types";

// Figma `badge/more` node 185-1912, sync 2026-08-05. Variant 없음 — 숫자만 바뀐다.

function BadgeMoreStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-6">
        {[7, 12, 99].map((count) => (
          <div key={count} className="flex flex-col items-center gap-2">
            <BadgeMore count={count} />
            <p className="text-caption-12-regular text-content-secondary">+{count}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">쓰이는 자리</p>
        <div className="flex w-fit items-center gap-1 rounded-md border border-border-primary px-3 py-2">
          <span className="flex size-12 items-center justify-center rounded-md bg-surface-secondary text-caption-12-regular text-content-disabled">
            야채
          </span>
          <span className="flex size-12 items-center justify-center rounded-md bg-surface-secondary text-caption-12-regular text-content-disabled">
            야채
          </span>
          <BadgeMore count={7} />
        </div>
        <p className="text-caption-12-regular text-content-secondary">
          야채 아이콘 줄 끝에 붙는 모습이에요.
        </p>
      </div>
    </div>
  );
}

export const badgeMoreStory: Story = {
  id: "badge-more",
  title: "Badge More",
  group: "컴포넌트",
  figma: "node 185-1912",
  description: "야채 아이콘 줄 끝에서 남은 개수를 알리는 +N 배지예요.",
  Component: BadgeMoreStory,
};
