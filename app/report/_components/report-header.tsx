import type { ReactNode } from "react";
import { cn } from "@/app/_lib/cn";

// Figma `header/vegetable-detail` — 화면GUI(원본) 364:8146 계열, sync 2026-08-13.
//
// 제보 플로우 4화면(F04-1·F04-2·F04-3)이 같은 인스턴스를 쓴다. F03 야채시세 상세·가게상세도
// **같은 컴포넌트를 쓰지만** 그쪽 코드는 이미 자체 헤더를 들고 있어 이번 작업에서 건드리지 않았다
// (그룹 5·6 정합 때 이 컴포넌트로 합칠 후보다).
//
// ⚠️ 레포에 이미 `app/_components/header-store-detail.tsx`가 있지만 **다른 규격이다** —
//    그건 Design Library `header/store-detail`(392-12144, 가게 상세 시트 맨 위)이고
//    이건 화면 상단 앱바다. 이름이 비슷해 혼동하기 쉬우니 합치지 않았다.
//
// get_design_context 실측(364:8146):
//   루트   bg surface/primary · border-b border/secondary · flex items-center justify-between
//          h-[49px] px-[4px] w-[390px]
//   좌     48×48 슬롯(py-[8px] items-center justify-center) + 24px 아이콘
//   중앙   body/16-semibold · content/primary
//   우     48×48 **빈 슬롯** — 좌우 대칭을 위한 자리다(제보 플로우 4화면 전부 비어 있음)
//
// 화면별 실측 차이:
//   364:8146 (F04-1 야채 제보)      chevron-left + "야채 제보"
//   364:8064 (F04-2 야채 카테고리)  chevron-left + "야채 카테고리"  (뒤로 주석: "F04-1로 이동")
//   364:8294 (F04-3 판매 장소 선택) **icon/close** + **제목 없음** — 텍스트 노드 자체가 빠져 있다
//   → 그래서 `title`을 optional로 뒀다. 없으면 좌우 슬롯만 남아 X 버튼이 왼쪽에 홀로 선다.
//
// 390px는 기준 뷰포트라 고정 폭으로 옮기지 않았다(conventions #3) — w-full로 두고
// 페이지가 max-w-97.5로 감싼다.
//
// 좌우 슬롯이 48×48이라 터치 타겟 44px 기준을 넘는다(accessibility 스킬).

export interface ReportHeaderProps {
  /**
   * 가운데 제목. 예: "야채 제보".
   * F04-3(364:8294)처럼 Figma에 제목 노드가 없는 화면은 넘기지 않는다.
   */
  title?: string;
  /** 왼쪽 48×48 슬롯 — 보통 뒤로가기. 비우면 자리만 차지한다. */
  leading?: ReactNode;
  /**
   * 오른쪽 48×48 슬롯. Figma의 제보 플로우에서는 **항상 비어 있다** —
   * 좌측 뒤로가기와 대칭을 만들어 제목을 화면 정중앙에 두기 위한 자리다.
   */
  trailing?: ReactNode;
  className?: string;
}

export function ReportHeader({ title, leading, trailing, className }: ReportHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-12.25 w-full items-center justify-between border-b border-border-secondary bg-surface-primary px-1",
        className,
      )}
    >
      <div className="flex size-12 shrink-0 items-center justify-center py-2">{leading}</div>
      {title ? (
        <p className="shrink-0 whitespace-nowrap text-body-16-semibold text-content-primary">
          {title}
        </p>
      ) : null}
      <div className="flex size-12 shrink-0 items-center justify-center py-2">{trailing}</div>
    </header>
  );
}
