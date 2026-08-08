import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `list/story` — Design Library node 186-3208 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 없음(단일 심볼). `row/story`(186-3196)를 세로로 쌓는 껍데기다.
//
// get_design_context 실측:
//   flex-col gap-[8px] items-start pt-[8px]   → flex-col gap-2 pt-2
//   (Figma 심볼 안에는 row/story 인스턴스가 2개 들어 있지만 그건 샘플 개수일 뿐이라
//    개수를 고정하지 않고 children으로 받는다)
//
// 시맨틱: 목록이므로 <ul>/<li>로 낸다. Figma는 프레임일 뿐이지만 스크린리더에 "항목 N개"가
// 전달되는 편이 낫고, 시각적으로는 list-style을 지운 상태라 Figma와 동일하다.

export interface ListStoryProps {
  /** `RowStory` 목록. 각 항목이 <li>로 감싸진다. */
  children: ReactNode[];
  /** 목록 전체의 접근 가능한 이름. */
  label?: string;
  className?: string;
}

export function ListStory({ children, label, className }: ListStoryProps) {
  return (
    <ul aria-label={label} className={cn("flex list-none flex-col items-start gap-2 pt-2", className)}>
      {children.map((child, index) => (
        // 자식은 호출자가 넘긴 정적 목록이라 index를 key로 써도 재정렬 문제가 없다.
        <li key={index} className="w-full">
          {child}
        </li>
      ))}
    </ul>
  );
}
