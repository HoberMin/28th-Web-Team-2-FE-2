import { RowRecentReport } from "../../_components/row-recent-report";
import type { Story } from "./types";

// Figma `row/recent-report` node 359-18537, sync 2026-08-08. 신규 컴포넌트.
// Variant 축은 배지가 붙느냐 마느냐 하나라 그 두 모습을 나열한다.
//
// ⚠️ 회색 동그라미는 야채 그림이 들어갈 자리다(에셋 다운로드 차단).

function VisualPlaceholder() {
  return (
    <span className="flex size-10 items-center justify-center rounded-full bg-surface-secondary text-caption-12-regular text-content-disabled">
      그림
    </span>
  );
}

function RowRecentReportStory() {
  return (
    <div className="flex max-w-90 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">오늘 들어온 제보</p>
        <RowRecentReport
          visual={<VisualPlaceholder />}
          name="양파"
          reportDate="today"
          price="99,900원"
          unit="/100kg"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">어제 들어온 제보</p>
        <RowRecentReport
          visual={<VisualPlaceholder />}
          name="대추방울토마토"
          reportDate="yesterday"
          price="8,500원"
          unit="/1kg"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">배지 없이</p>
        <RowRecentReport
          visual={<VisualPlaceholder />}
          name="고춧가루(중국산)"
          price="132,000원"
          unit="/100kg"
        />
        <p className="text-caption-12-regular text-content-secondary">
          언제 들어온 값인지 표시할 필요가 없으면 배지를 빼고 값만 보여 줘요.
        </p>
      </div>
    </div>
  );
}

export const rowRecentReportStory: Story = {
  id: "row-recent-report",
  title: "Row Recent Report",
  group: "컴포넌트",
  figma: "node 359-18537",
  description: "최근 들어온 제보 하나를 야채·시점·가격으로 보여 주는 행이에요.",
  Component: RowRecentReportStory,
};
