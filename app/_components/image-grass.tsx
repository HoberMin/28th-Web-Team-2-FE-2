import Image from "next/image";
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
// Figma MCP Plugin API에서 왼쪽·오른쪽 원본 벡터를 각각 SVG로 export했다.
// 카드 확대판은 두 묶음을 개별 확대해야 전체 캔버스만 커지고 풀잎은 작게 남는 문제가 없다.
//
// 순수 장식이라 스크린리더에서 통째로 숨긴다(WCAG 1.1.1 — 장식 이미지).

export interface ImageGrassProps {
  /** 표시 높이. 기본 30은 Figma 원본, 48은 추천 가게 카드에서 두 풀 묶음을 1.6배 확대한다. */
  height?: 30 | 48;
  /** 왼쪽 풀 그림 슬롯(81×30). 안의 그림이 칸보다 크면 잘린다. */
  left?: ReactNode;
  /** 오른쪽 풀 그림 슬롯(80×30). */
  right?: ReactNode;
  className?: string;
}

const HEIGHT = {
  30: {
    root: "h-7.5 w-89.5 gap-48",
    left: "h-7.5 w-20.25",
    right: "h-7.5 w-20",
  },
  48: {
    root: "h-12 w-full justify-between",
    left: "h-12 w-32.5",
    right: "h-12 w-32",
  },
} as const;

export function ImageGrass({ height = 30, left, right, className }: ImageGrassProps) {
  const size = HEIGHT[height];

  return (
    <div aria-hidden="true" className={cn("flex shrink-0 items-end", size.root, className)}>
      <span className={cn("relative flex shrink-0 items-end overflow-hidden", size.left)}>
        {left ?? (
          <Image
            src="/figma/design-library/images/grass-left.svg"
            alt=""
            width={81}
            height={30}
            unoptimized
            className="size-full"
          />
        )}
      </span>
      <span className={cn("relative flex shrink-0 items-end", size.right)}>
        {right ?? (
          <Image
            src="/figma/design-library/images/grass-right.svg"
            alt=""
            width={80}
            height={30}
            unoptimized
            className="size-full"
          />
        )}
      </span>
    </div>
  );
}
