import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `image/vegetable-onion` — Design Library node 185-1654 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 없음(단일 심볼). Figma에서 export한 양파 그림을 기본으로 렌더한다.
//
// get_design_context 실측:
//   루트   `overflow-clip relative size-[48px]`        → size-12 + overflow-hidden
//   내부   img-onion 39×45.797 를 가운데 정렬(translate -50%) — 즉 **그림이 칸보다 세로로 크고,
//          칸 밖으로 넘치는 부분은 잘린다.** 그래서 래퍼에 overflow-hidden이 필요하다.
//
// 실사용 인스턴스는 크기를 바꿔 쓴다(item/vegetable 48 · list/lowest-vegetable 40 ·
// row/recent-report 40). 그래서 기본 48로 두고 `className`으로 크기를 덮을 수 있게 했다.
//
// Figma MCP 스크린샷 export로 컴포넌트의 크롭 결과를
// `public/figma/design-library/images/onion.png`에 저장했다.

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
      {children ?? (
        <Image
          src="/figma/design-library/images/onion.png"
          alt=""
          fill
          unoptimized
          sizes="48px"
          className="object-contain"
        />
      )}
    </span>
  );
}
