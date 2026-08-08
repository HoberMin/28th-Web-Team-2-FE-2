import { ListRecentReport } from "../../_components/list-recent-report";
import { RowRecentReport } from "../../_components/row-recent-report";
import { FigmaImage } from "./figma-asset";
import type { Story } from "./types";

// Figma `list/recent-report` node 392-11786, sync 2026-08-08. 신규 컴포넌트. Variant 없음.
// Figma 심볼 안에는 오늘·어제 행이 하나씩 들어 있고 **행 사이 간격이 0**이다
// (`list/story`와 다르니 주의). 개수는 샘플일 뿐이라 바꿀 수 있게 만들었다.
//
function VegetableImage() {
  return (
    <FigmaImage name="onion.png" width={40} height={40} className="size-10 object-contain" />
  );
}

const ROWS = [
  { name: "양파", reportDate: "today" as const, price: "99,900원", unit: "/100kg" },
  { name: "대추방울토마토", reportDate: "yesterday" as const, price: "8,500원", unit: "/1kg" },
  { name: "얼갈이배추", reportDate: "yesterday" as const, price: "3,200원", unit: "/1kg" },
];

function ListRecentReportStory() {
  return (
    <div className="flex max-w-90 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">여러 행을 쌓은 모습</p>
        <ListRecentReport label="최근 제보 목록">
          {ROWS.map((row) => (
            <RowRecentReport
              key={row.name}
              visual={<VegetableImage />}
              name={row.name}
              reportDate={row.reportDate}
              price={row.price}
              unit={row.unit}
            />
          ))}
        </ListRecentReport>
        <p className="text-caption-12-regular text-content-secondary">
          행 사이에 따로 간격을 두지 않아 촘촘하게 이어져요.
        </p>
      </div>
    </div>
  );
}

export const listRecentReportStory: Story = {
  id: "list-recent-report",
  title: "List Recent Report",
  group: "컴포넌트",
  figma: "node 392-11786",
  description: "최근 제보 행을 세로로 쌓아 보여 주는 목록이에요.",
  Component: ListRecentReportStory,
};
