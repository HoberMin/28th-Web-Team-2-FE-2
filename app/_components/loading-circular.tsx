import Image from "next/image";
import { cn } from "../_lib/cn";

// Figma `loading/circular` — Design Library node 436-25632 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 축은 `animate`(false·true) 하나 — 심볼 2개(436-25631 · 436-25630).
//
// Figma MCP Plugin API에서 animate=false는 원본 SVG로, animate=true는 이미지 해시의 원본 GIF
// (150×150, GIF89a)로 export했다. 따라서 형상·두께·시작 각도·재생 속도를 추정하지 않는다.
//
// ⚠️ 단, **색을 문맥에서 받아야 하는 자리**(`currentColor`)에서는 GIF를 쓸 수 없다.
//    브라우저가 mask-image의 애니메이션 GIF를 첫 프레임에서 멈추기 때문에 회전이 죽는다.
//    그래서 currentColor일 때는 **정적 SVG를 마스크로 쓰고 CSS로 돌린다** — 이때만 재생 속도가
//    Figma 원본이 아니라 우리 값(1초 등속)이다. 색을 얻는 대가로 감수한 유일한 추정이다.
//    (2026-08-21 디자인 QA: "스피너에 JDS 그린 계열을 넣어주세요, 지금 잘 안 보여요")

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
  // currentColor는 마스크로 그리는데 GIF 마스크는 움직이지 않는다 → 정적 SVG + CSS 회전.
  const src =
    animate && !currentColor
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
          className={cn(
            "size-4.5 bg-current",
            // 모션 민감 사용자에게는 회전을 멈춘다(WCAG 2.3.3). 멈춰도 원호는 보이므로
            // "불러오는 중"이라는 정보 자체는 label이 계속 전달한다.
            animate && "animate-spin motion-reduce:animate-none",
          )}
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
