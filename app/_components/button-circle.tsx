import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `button/circle` — Design Library node 350-17885 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-06.
// 신규 컴포넌트. 흰 원(48×48, radius/full) + drop-shadow(0px 0px 3px rgba(74,86,103,0.22) →
// @theme `--shadow-floating`) 안에 하트 등 아이콘 슬롯 하나.
//
// Figma 축은 style(stroke·fill) × state(normal·pressed) = 4종이지만 **색은 style이 아니라
// state가 결정한다** — normal은 content/primary(#262f3c), pressed는 content/brand/light(#05a163).
// style은 어떤 아이콘 글리프(외곽선 vs 채움)를 보여줄지만 정하고, 그 글리프 자체는 이 컴포넌트가
// 들고 있지 않다 (아래 아이콘 슬롯 설명 참고).
//
// ⚠️ 하트 아이콘 SVG는 코드로 가져올 수 없다 — asset 다운로드가 정책상 차단돼 있다
//    (figma-bridge §0-0, button.tsx·text-field.tsx와 같은 이유). 그래서 아이콘을 하드코딩하지
//    않고 `icon: ReactNode` 필수 슬롯으로 받는다. 아이콘은 `currentColor`를 쓰는 형태로 넘겨받는다고
//    가정하고, 이 컴포넌트가 wrapper의 text color를 state에 따라 바꿔서 아이콘 색이 자동으로
//    따라가게 한다(Button의 leadingIcon 래퍼 span과 같은 패턴).
//
// 대비 검산: content/primary(#262f3c) on 흰 배경 ≈ 13.5:1, content/brand/light(#05a163) on
// 흰 배경 ≈ 3.34:1 — 둘 다 아이콘 기준(3:1) 통과.
//
// Figma엔 disabled 심볼이 없어 만들지 않았다. 네이티브 `disabled` 속성은 그대로 클릭을 막지만
// 별도 색 처리는 없다.

const BASE =
  "inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-primary shadow-floating";

/** Figma의 style 축 — 어떤 아이콘 글리프(외곽선·채움)를 보여주는지 정보용. 색상엔 영향 없음. */
export type ButtonCircleVariant = "stroke" | "fill";
/** Figma State 축. 기본 `normal`이면 눌림은 `:active`로 자동 적용된다. */
export type ButtonCircleState = "normal" | "pressed";

const COLOR: Record<ButtonCircleState, string> = {
  normal: "text-content-primary active:text-content-brand-light",
  pressed: "text-content-brand-light",
};

export interface ButtonCircleProps extends ComponentPropsWithoutRef<"button"> {
  /** Figma의 style 축(stroke·fill) — 어떤 아이콘 글리프를 보여줄지 caller가 판단하는 데 참고하는
   *  정보용 값이다. 렌더에는 영향 없다(색은 state가 결정). */
  variant?: ButtonCircleVariant;
  state?: ButtonCircleState;
  /** Figma의 아이콘 슬롯(중앙, 24×24). currentColor를 쓰는 SVG를 넘겨받는다고 가정. 필수. */
  icon: ReactNode;
  /** 아이콘만 있는 버튼이라 접근 가능한 이름이 필수다 (WCAG 4.1.2 · 아이콘 버튼 라벨). */
  "aria-label": string;
}

// ⚠️ 2026-08-06 리뷰에서 발견: 예전엔 여기서 `aria-pressed`를 `variant`(stroke·fill)로부터
// 자동 유추했는데, 실제 화면 색(눌림 여부처럼 보이는 것)은 `state`가 결정하는 축이라 서로 달랐다.
// 그래서 시각 사용자와 스크린리더 사용자가 반대 상태를 인지하는 사고가 났다(스토리의
// variant="stroke" state="pressed" 조합에서 실측). 자동 유추를 아예 없애고, 토글로 쓸 때는
// caller가 `aria-pressed`를 직접 넘기도록 한다(ComponentPropsWithoutRef가 이미 허용) —
// 토글이 아닌 용도(공유·닫기 등 일반 원형 버튼)로 쓸 때 억지로 토글로 announce되는 것도 막는다.

export function ButtonCircle({
  variant = "stroke",
  state = "normal",
  icon,
  className,
  type = "button",
  ...rest
}: ButtonCircleProps) {
  return (
    <button type={type} className={cn(BASE, COLOR[state], className)} {...rest}>
      <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center">
        {icon}
      </span>
    </button>
  );
}
