import { HeaderStoreDetail } from "../../_components/header-store-detail";
import { RowRecentReport } from "../../_components/row-recent-report";
import { SectionRecentReport } from "../../_components/section-recent-report";
import { SheetStoreDetail } from "../../_components/sheet-store-detail";
import type { Story } from "./types";

// Figma `sheet/store-detail` node 392-12707, sync 2026-08-08. Variant 없음.
// 헤더 + 최근 제보 구획 + 아래 버튼을 한 장에 담는 규칙이라 group은 "패턴"이다(design-guide §1-1).
//
// 시트 자체는 지도 위로 올라오는 화면이라, 회색 판 위에 얹어 그림자와 위쪽 둥근 모서리가 보이게 뒀다.
//
// ⚠️ 아이콘·야채 그림은 Figma 에셋을 코드로 가져올 수 없어 자리표시·임시 도형으로 대신했다.
// ⚠️ 여닫는 동작(드래그·바깥 누르면 닫기·포커스 가두기)은 이 규격 밖이다 — 화면에 붙일 때 추가한다.

function ActionButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary p-2 text-content-primary"
    >
      <span aria-hidden="true" className="flex size-5 items-center justify-center">
        {children}
      </span>
    </button>
  );
}

function HeartOutlineIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s-7.5-4.6-10-9.1C.6 8.6 2 5 5.5 5c2 0 3.4 1.1 4.5 2.6C11.1 6.1 12.5 5 14.5 5 18 5 19.4 8.6 22 11.9 19.5 16.4 12 21 12 21Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function VisualPlaceholder() {
  return (
    <span className="flex size-10 items-center justify-center rounded-full bg-surface-secondary text-caption-12-regular text-content-disabled">
      그림
    </span>
  );
}

const ROWS = [
  { name: "양파", reportDate: "today" as const, price: "99,900원", unit: "/100kg" },
  { name: "대추방울토마토", reportDate: "yesterday" as const, price: "8,500원", unit: "/1kg" },
];

function StoreHeader() {
  return (
    <HeaderStoreDetail
      name="농협하나로마트"
      openState="영업중"
      openHours="수 10:00 - 22:00"
      distance="670m"
      walkTime="도보 10분"
      affordableCount={4}
      todayReportCount={1}
      actions={
        <>
          <ActionButton label="찜하기">
            <HeartOutlineIcon />
          </ActionButton>
          <ActionButton label="닫기">
            <CloseIcon />
          </ActionButton>
        </>
      }
    />
  );
}

function SheetStoreDetailStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">제보가 있을 때</p>
        <div className="w-full max-w-97.5 rounded-lg bg-surface-secondary pt-10">
          <SheetStoreDetail header={<StoreHeader />}>
            <SectionRecentReport state="populated">
              {ROWS.map((row) => (
                <RowRecentReport
                  key={row.name}
                  visual={<VisualPlaceholder />}
                  name={row.name}
                  reportDate={row.reportDate}
                  price={row.price}
                  unit={row.unit}
                />
              ))}
            </SectionRecentReport>
          </SheetStoreDetail>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">아직 제보가 없을 때</p>
        <div className="w-full max-w-97.5 rounded-lg bg-surface-secondary pt-10">
          <SheetStoreDetail header={<StoreHeader />}>
            <SectionRecentReport state="empty" />
          </SheetStoreDetail>
        </div>
        <p className="text-caption-12-regular text-content-secondary">
          회색 판은 시트가 올라오는 지도 자리를 대신한 거예요.
        </p>
      </div>
    </div>
  );
}

export const sheetStoreDetailStory: Story = {
  id: "sheet-store-detail",
  title: "Sheet Store Detail",
  group: "패턴",
  figma: "node 392-12707",
  description: "지도에서 가게를 눌렀을 때 아래에서 올라오는 상세 시트예요.",
  Component: SheetStoreDetailStory,
};
