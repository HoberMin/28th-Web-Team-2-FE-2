import type { ReactNode } from "react";
import { Button } from "./button";
import { ListStory } from "./list-story";
import { cn } from "../_lib/cn";

// Figma `card/story-list` — Design Library node 186-3233 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 없음(단일 심볼). `list/story`(186-3208)를 카드로 감싸고 아래에 CTA 버튼을 붙인 것.
//
// get_design_context 실측:
//   루트     bg background/secondary(#f9f9fb) · radius/xl(16px) · overflow-clip
//            pt-[8px] pb-[20px] px-[20px] w-[358px]
//            → bg-background-secondary rounded-xl overflow-hidden pt-2 pb-5 px-5
//              (358px는 Figma 프레임 폭이라 w-full로 따라간다)
//   content  flex-col gap-[12px] w-full → gap-3
//   목록     list/story 인스턴스 그대로 → ListStory 재사용
//   CTA      button/base = primary·medium (bg action-primary/default · px-28 py-12 · radius/lg ·
//            body/16-semibold · content/inverse) **폭이 w-full** → Button variant="primary" + w-full
//            문구 "시세 이야기 더보기"는 Figma가 심볼에 넣어 둔 값이지만, 카드마다 달라질 수 있는
//            문구라 prop으로 열고 기본값만 Figma 값으로 뒀다.
//
// ⚠️ 대비: CTA는 content/inverse(#f9f9fb) on action-primary/default(#10b972) = 2.43:1로
//    본문 기준 4.5:1에 미달한다. 이미 domain.md에 기록된 Button 자체의 미달 항목이 그대로 따라온 것이고,
//    Figma 원본을 유지한다(figma-bridge §4). 카드 배경 위 제목은 content/primary on #f9f9fb = 12.85:1로 통과.

export interface CardStoryListProps {
  /** `RowStory` 목록. 그대로 `ListStory`에 전달된다. */
  children: ReactNode[];
  /** 목록의 접근 가능한 이름. */
  label?: string;
  /** CTA 문구. 기본값은 Figma 심볼의 문구. */
  actionLabel?: string;
  className?: string;
}

export function CardStoryList({
  children,
  label,
  actionLabel = "시세 이야기 더보기",
  className,
}: CardStoryListProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-background-secondary px-5 pt-2 pb-5",
        className,
      )}
    >
      <div className="flex w-full flex-col items-start gap-3">
        <ListStory label={label}>{children}</ListStory>
        <Button variant="primary" size="medium" className="w-full">
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
