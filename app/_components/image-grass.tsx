import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `image/grass` — Design Library node 185-1460 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 없음(단일 심볼). 카드 아래쪽에 깔리는 장식용 풀 그림 한 줄이다.
//
// get_design_context 실측:
//   루트        flex gap-[192px] items-center w-[358px]  → w-89.5 gap-48
//   grass-left  81×30, overflow-clip (안의 art가 75×31로 살짝 커서 잘린다)
//   grass-right 80×30
//
// 왼쪽 81 + 간격 192 + 오른쪽 80 = 353으로 358에 거의 꽉 찬다. `justify-between`으로 바꾸면
// 어떤 너비에서도 양끝에 붙어 더 편하지만, Figma가 명시한 건 고정 간격이라 원본 값을 그대로 옮겼다
// (임의 디자인 결정 금지). 너비가 358이 아닌 곳에 쓰려면 호출부가 className으로 조정한다.
//
// ⚠️ 풀 그림(SVG 2개)은 `download_assets`로만 받을 수 있고 그 경로가 레포 정책상 차단돼 있다
//    (figma-bridge §0-0). 그래서 좌·우 각각 슬롯으로 비워 뒀다.
//
// 순수 장식이라 스크린리더에서 통째로 숨긴다(WCAG 1.1.1 — 장식 이미지).

export interface ImageGrassProps {
  /** 왼쪽 풀 그림 슬롯(81×30). 안의 그림이 칸보다 크면 잘린다. */
  left?: ReactNode;
  /** 오른쪽 풀 그림 슬롯(80×30). */
  right?: ReactNode;
  className?: string;
}

export function ImageGrass({ left, right, className }: ImageGrassProps) {
  return (
    <div aria-hidden="true" className={cn("flex w-89.5 items-center gap-48", className)}>
      <span className="relative flex h-7.5 w-20.25 shrink-0 items-center justify-center overflow-hidden">
        {left}
      </span>
      <span className="relative flex h-7.5 w-20 shrink-0 items-center justify-center">
        {right}
      </span>
    </div>
  );
}
