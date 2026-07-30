import Link from "next/link";
import IconCheckmarkCircleFill from "@karrotmarket/react-monochrome-icon/IconCheckmarkCircleFill";
import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";

// 홈 → 즉석 판단(F10) 진입점.
// 매장 가격표 앞에서 켜는 앱이라, 홈에서 품목을 찾아 들어가는 경로(스크롤 4회)와 별도로
// "지금 이 가격 사도 되나"만 묻는 최단 경로를 홈 상단에 둔다.
export function QuickJudgeEntry() {
  return (
    <Link
      href="/prototype/judge"
      className="flex items-center gap-3 rounded-2xl bg-bg-brand-solid px-4 py-4 text-fg-brand-contrast active:opacity-90"
    >
      <span className="shrink-0 [&_svg]:size-6" aria-hidden="true">
        <IconCheckmarkCircleFill />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-body-16-semibold">이 가격 사도 될까요?</span>
        <span className="text-caption-12-regular opacity-90">
          가격만 입력하면 우리 동네 기준으로 바로 알려드려요
        </span>
      </span>
      <span className="shrink-0 [&_svg]:size-5" aria-hidden="true">
        <IconChevronRightLine />
      </span>
    </Link>
  );
}
