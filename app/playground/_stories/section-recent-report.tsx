import { RowRecentReport } from "../../_components/row-recent-report";
import { SectionRecentReport } from "../../_components/section-recent-report";
import { FigmaImage } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `section/recent-report` node 392-12708, sync 2026-08-08.
// Figma 심볼은 2개(state=populated · state=empty)라 그 2개를 나열한다.
// 여러 부품을 조합하는 규칙이라 group은 "패턴"이다(design-guide §1-1).
//
// **빈 상태가 Figma에 실제로 있는 드문 경우다** — 우리가 지어낸 게 아니라 원본 심볼 그대로다.
//
function VegetableImage() {
  return (
    <FigmaImage name="onion.png" width={40} height={40} className="size-10 object-contain" />
  );
}

const ROWS = [
  { name: "양파", reportDate: "today" as const, price: "99,900원", unit: "/100kg" },
  { name: "대추방울토마토", reportDate: "yesterday" as const, price: "8,500원", unit: "/1kg" },
];

function SectionRecentReportStory() {
  return (
    <div className="flex max-w-90 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">제보가 있을 때</p>
        <SectionRecentReport state="populated">
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
        </SectionRecentReport>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">아직 제보가 없을 때</p>
        <SectionRecentReport state="empty" />
        <p className="text-caption-12-regular text-content-secondary">
          빈 화면 문구도 디자인에 정해져 있어요.
        </p>
      </div>
    </div>
  );
}

export const sectionRecentReportStory: Story = {
  id: "section-recent-report",
  title: "Section Recent Report",
  group: "패턴",
  figma: "node 392-12708",
  description: "가게 상세의 최근 제보 구획이에요. 제보가 없을 때 모습도 함께 정해져 있어요.",
  Component: SectionRecentReportStory,
};
