import { HeaderStoreDetail } from "../../_components/header-store-detail";
import type { Story } from "./types";

// Figma `header/store-detail` node 392-12144, sync 2026-08-08. Variant 없음.
// 여러 부품을 조합하는 규칙이라 group은 "패턴"이다(design-guide §1-1).
//
// ⚠️ 오른쪽 위 동그란 버튼 2개는 컴포넌트가 아니라 **슬롯**이다. Figma가 이 자리에서
// button/circle을 회색 배경·36px로 덮어쓰고 있어 우리 ButtonCircle(흰 배경·48px)과 다르기 때문이다.
// 그래서 여기 스토리에서 그 회색 원형 버튼을 직접 조립해 보여 준다.
// 하트·닫기 아이콘은 Figma 에셋을 가져올 수 없어 임시 도형으로 대신했다.

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

function Actions() {
  return (
    <>
      <ActionButton label="찜하기">
        <HeartOutlineIcon />
      </ActionButton>
      <ActionButton label="닫기">
        <CloseIcon />
      </ActionButton>
    </>
  );
}

function HeaderStoreDetailStory() {
  return (
    <div className="flex max-w-90 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">기본</p>
        <HeaderStoreDetail
          name="농협하나로마트"
          openState="영업중"
          openHours="수 10:00 - 22:00"
          distance="670m"
          walkTime="도보 10분"
          affordableCount={4}
          todayReportCount={1}
          actions={<Actions />}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">가게 이름이 길 때</p>
        <HeaderStoreDetail
          name="농협하나로마트 신중동역점 지하1층 식품관"
          openState="영업종료"
          openHours="수 10:00 - 22:00"
          distance="1.2km"
          walkTime="도보 18분"
          affordableCount={12}
          todayReportCount={0}
          actions={<Actions />}
        />
        <p className="text-caption-12-regular text-content-secondary">
          이름이 길어도 오른쪽 버튼 자리를 침범하지 않고 …로 줄어들어요.
        </p>
      </div>
    </div>
  );
}

export const headerStoreDetailStory: Story = {
  id: "header-store-detail",
  title: "Header Store Detail",
  group: "패턴",
  figma: "node 392-12144",
  description: "가게 상세 시트 맨 위 묶음이에요. 이름·영업정보·요약 배지를 함께 보여 줘요.",
  Component: HeaderStoreDetailStory,
};
