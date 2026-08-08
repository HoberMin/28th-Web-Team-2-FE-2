import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `image/vegetable-onion` — Design Library node 185-1654 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 없음(단일 심볼). 야채 그림을 담는 **최소 래퍼**다 — 그림 자체는 들고 있지 않다.
//
// get_design_context 실측:
//   루트   `overflow-clip relative size-[48px]`        → size-12 + overflow-hidden
//   내부   img-onion 39×45.797 를 가운데 정렬(translate -50%) — 즉 **그림이 칸보다 세로로 크고,
//          칸 밖으로 넘치는 부분은 잘린다.** 그래서 래퍼에 overflow-hidden이 필요하다.
//
// 실사용 인스턴스는 크기를 바꿔 쓴다(item/vegetable 48 · list/lowest-vegetable 40 ·
// row/recent-report 40). 그래서 기본 48로 두고 `className`으로 크기를 덮을 수 있게 했다.
//
// ⚠️ 양파 그림(PNG)은 `download_assets`로만 받을 수 있고 그 경로가 레포 정책상 차단돼 있다
//    (figma-bridge §0-0). 그래서 그림은 `children` 슬롯으로 비워 뒀다.
//    이름이 `-onion`인 건 Figma 심볼 이름을 그대로 따른 것이고, 실제로는 어떤 야채 그림이든 담는다.

export interface ImageVegetableOnionProps {
  /** 야채 그림. 칸보다 크면 넘치는 부분이 잘린다(Figma 원본 동작). */
  children?: ReactNode;
  className?: string;
}

export function ImageVegetableOnion({ children, className }: ImageVegetableOnionProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex size-12 shrink-0 items-center justify-center overflow-hidden",
        className,
      )}
    >
      {children}
    </span>
  );
}
