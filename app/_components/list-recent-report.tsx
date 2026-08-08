import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `list/recent-report` — Design Library node 392-11786 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 없음(단일 심볼). `row/recent-report`(359-18537)를 세로로 쌓는 껍데기다.
//
// get_design_context 실측:
//   flex-col items-start w-[358px] — **gap이 없다**(0). list/story(gap-2 + pt-2)와 다르니 주의.
//   358px는 Figma 프레임 폭이라 w-full로 따라간다.
//   심볼 안의 행은 2개(date=today / date=yesterday)지만 그건 샘플 개수라 children으로 받는다.
//
// 시맨틱: list/story와 같은 이유로 <ul>/<li>로 낸다.

export interface ListRecentReportProps {
  /** `RowRecentReport` 목록. 각 항목이 <li>로 감싸진다. */
  children: ReactNode[];
  /** 목록 전체의 접근 가능한 이름. */
  label?: string;
  className?: string;
}

export function ListRecentReport({ children, label, className }: ListRecentReportProps) {
  return (
    <ul aria-label={label} className={cn("flex w-full list-none flex-col items-start", className)}>
      {children.map((child, index) => (
        // 자식은 호출자가 넘긴 정적 목록이라 index를 key로 써도 재정렬 문제가 없다.
        <li key={index} className="w-full">
          {child}
        </li>
      ))}
    </ul>
  );
}
