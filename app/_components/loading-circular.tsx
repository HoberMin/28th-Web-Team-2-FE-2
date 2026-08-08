import Image from "next/image";
import { cn } from "../_lib/cn";

// Figma `loading/circular` — Design Library node 436-25632 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 축은 `animate`(false·true) 하나 — 심볼 2개(436-25631 · 436-25630).
//
// Figma MCP Plugin API에서 animate=false는 원본 SVG로, animate=true는 이미지 해시의 원본 GIF
// (150×150, GIF89a)로 export했다. 따라서 형상·두께·시작 각도·재생 속도를 추정하지 않는다.

export interface LoadingCircularProps {
  /** Figma의 animate 축. true면 회전한다. */
  animate?: boolean;
  /**
   * 스크린리더용 설명. 주면 `role="status"`로 읽히고, 생략하면 장식으로 취급해 숨긴다.
   * 버튼 안처럼 바깥에 이미 `aria-busy`가 있는 자리에서는 생략한다.
   */
  label?: string;
  /** 버튼처럼 문맥의 글자색을 따라야 할 때 원본 에셋을 마스크로 사용한다. */
  currentColor?: boolean;
  className?: string;
}

export function LoadingCircular({
  animate = false,
  label,
  currentColor = false,
  className,
}: LoadingCircularProps) {
  const src = animate
    ? "/figma/design-library/loading/circular-animated.gif"
    : "/figma/design-library/loading/circular-static.svg";

  return (
    <span
      className={cn("inline-flex size-4.5 shrink-0 items-center justify-center", className)}
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : "true"}
    >
      {currentColor ? (
        <span
          aria-hidden="true"
          className="size-4.5 bg-current"
          style={{
            WebkitMaskImage: `url("${src}")`,
            maskImage: `url("${src}")`,
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
      ) : (
        <Image
          src={src}
          alt=""
          width={18}
          height={18}
          unoptimized
          aria-hidden="true"
        />
      )}
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
