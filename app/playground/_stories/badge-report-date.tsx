import { BadgeReportDate } from "../../_components/badge-report-date";
import type { Story } from "./types";

// Figma `badge/report-date` node 359-18591, sync 2026-08-08. 신규 컴포넌트.
// Figma 심볼은 2개(date=today · date=yesterday)라 그 2개만 나열한다.
// 문구도 Figma가 심볼에 고정해 둔 값이라 바꿀 수 없다.

function BadgeReportDateStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <BadgeReportDate date="today" />
          <p className="text-caption-12-regular text-content-secondary">today</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <BadgeReportDate date="yesterday" />
          <p className="text-caption-12-regular text-content-secondary">yesterday</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">쓰이는 자리</p>
        <div className="flex w-fit items-center gap-2 rounded-md border border-border-primary px-3 py-2">
          <span className="text-body-16-semibold text-content-primary">양파</span>
          <BadgeReportDate date="today" />
          <span className="text-body-16-bold text-content-primary">99,900원</span>
        </div>
        <p className="text-caption-12-regular text-content-secondary">
          제보 목록에서 값 옆에 붙어 언제 들어온 가격인지 알려 줘요.
        </p>
      </div>
    </div>
  );
}

export const badgeReportDateStory: Story = {
  id: "badge-report-date",
  title: "Badge Report Date",
  group: "컴포넌트",
  figma: "node 359-18591",
  description: "제보된 가격이 오늘 것인지 어제 것인지 알리는 작은 배지예요.",
  Component: BadgeReportDateStory,
};
