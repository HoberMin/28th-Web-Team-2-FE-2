import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `button/cta_md` — Design Library node 160-2855 (fileKey WfW1Nkx1oiOWBHNwrw48IL).
// sync 2026-08-05 → **재sync 2026-08-06**: size(medium·small) 축 + variant `outlined` 추가.
// 지금 Figma 프레임엔 심볼 14개: Variant(Primary·Secondary·Tertiary·Outlined) ×
// Size(Medium·Small) × State(Normal·Pressed·Disabled, outlined는 Normal만).
//
// Figma의 State 축은 코드에서 이렇게 나뉜다:
//   Normal   → 기본
//   Pressed  → `:active` (CSS가 자동 처리)   + 갤러리 고정용 `state="pressed"`
//   Disabled → 네이티브 `disabled` 속성 (`disabled:` 변형)
// hover는 Figma에 정의가 없어 만들지 않았다 (임의 추가 금지).
//
// ⚠️ Secondary의 pressed 배경은 Figma가 `action-secondary/pressed`(gray-700)가 아니라
//    `content/secondary`(gray-600)에 바인딩해 두었다. 원본 그대로 옮겼다 —
//    시맨틱상 어색하므로 Figma에서 의도한 값인지 확인이 필요하다.
//
// ⚠️ `outlined`는 Figma에 normal 심볼만 있다(medium 390-20833 · small 417-23114) —
//    pressed·disabled 심볼이 없어서 만들지 않았다. `state`·네이티브 `disabled`를 넘겨도
//    outlined는 항상 normal 스타일로 렌더된다.
//
// size는 get_design_context로 실측 확인(2026-08-06):
//   medium primary(160-2855 계열) — px-7 py-3 gap-2 rounded-lg(12) text-body-16-semibold (기존값 그대로)
//   small primary(417-22470)     — px-5 py-2 gap-1 rounded-md(8)  text-body-14-semibold
//   outlined medium(390-20833)   — bg surface/primary + border border/primary(1px) + text content/secondary,
//                                  패딩·radius는 medium과 동일(px-7 py-3 gap-2 rounded-lg) · text-body-16-semibold
//   outlined small(417-23114)   — 패딩·radius는 small과 동일하지만 **폰트가 body-14-medium(500)** —
//                                  primary/secondary/tertiary의 small(body-14-semibold·600)과 굵기가 다르다.
//                                  (2026-08-06 리뷰에서 실측 확인 — 처음엔 small 클래스를 그대로 재사용해서 틀렸었다)
//
// 그래서 텍스트 굵기는 SIZE(레이아웃 전용)가 아니라 variant×size 조합별 TEXT에서 따로 결정한다 —
// 하나의 요소에 font-weight 유틸이 두 개 붙어 cn()의 클래스 선언 순서에 의존하는 걸 피하기 위함
// (app/_lib/cn.ts는 tailwind-merge 없는 단순 join이라 중복 유틸리티의 결과가 @theme 선언 순서에
// 우연히 의존하게 된다 — 그 경로 자체를 없앤다).

const BASE = "inline-flex items-center justify-center";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "outlined";
export type ButtonSize = "medium" | "small";

/** Figma State 축. 기본 `normal`이면 눌림은 `:active`로 자동 적용된다. outlined엔 적용되지 않는다. */
export type ButtonState = "normal" | "pressed";

/** 색 상태가 있는 3종(primary·secondary·tertiary) 전용 타입 — outlined는 아래에서 별도 처리한다. */
export type ColorVariant = "primary" | "secondary" | "tertiary";

const SIZE: Record<ButtonSize, string> = {
  medium: "gap-2 rounded-lg px-7 py-3",
  small: "gap-1 rounded-md px-5 py-2",
};

const TEXT: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: { medium: "text-body-16-semibold", small: "text-body-14-semibold" },
  secondary: { medium: "text-body-16-semibold", small: "text-body-14-semibold" },
  tertiary: { medium: "text-body-16-semibold", small: "text-body-14-semibold" },
  outlined: { medium: "text-body-16-semibold", small: "text-body-14-medium" },
};

const NORMAL: Record<ColorVariant, string> = {
  primary:
    "bg-action-primary-default text-content-inverse active:bg-action-primary-pressed disabled:bg-action-primary-disabled",
  secondary:
    "bg-action-secondary-default text-content-inverse active:bg-content-secondary disabled:bg-action-secondary-disabled",
  tertiary:
    "bg-action-tertiary-default text-content-secondary active:bg-action-tertiary-pressed disabled:bg-action-tertiary-disabled",
};

// `state="pressed"`로 눌린 모습을 고정할 때 쓰는 세트 — 배경만 pressed 값으로 바꾼다.
// NORMAL과 배타적으로 적용해 같은 속성이 두 클래스로 겹치지 않게 한다(cn 주석 참고).
const PRESSED: Record<ColorVariant, string> = {
  primary:
    "bg-action-primary-pressed text-content-inverse disabled:bg-action-primary-disabled",
  secondary: "bg-content-secondary text-content-inverse disabled:bg-action-secondary-disabled",
  tertiary:
    "bg-action-tertiary-pressed text-content-secondary disabled:bg-action-tertiary-disabled",
};

// outlined는 상태 축이 없어 NORMAL/PRESSED 밖에 고정 클래스로 둔다.
// 대비 참고: content/secondary(#697383) on surface/primary(#fff) ≈ 4.79:1 (텍스트 AA 통과),
// border/primary(#e5e8ef) on 흰 배경 ≈ 1.23:1 (UI 컴포넌트 3:1 기준 미달) — Figma 원본 그대로 두고
// 스토리에 미달 사실을 남긴다(임의로 진한 색으로 바꾸지 않음).
const OUTLINED = "bg-surface-primary text-content-secondary border border-border-primary";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
  /** Figma의 Leading Icon 슬롯(16×16). 비우면 아이콘 없이 렌더된다. */
  leadingIcon?: ReactNode;
  /** Figma의 Trailing Icon 슬롯(16×16). */
  trailingIcon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "medium",
  state = "normal",
  leadingIcon,
  trailingIcon,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const colorClasses =
    variant === "outlined"
      ? OUTLINED
      : state === "pressed"
        ? PRESSED[variant]
        : NORMAL[variant];

  return (
    <button
      type={type}
      className={cn(BASE, SIZE[size], TEXT[variant][size], colorClasses, className)}
      {...rest}
    >
      {leadingIcon ? (
        <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
          {leadingIcon}
        </span>
      ) : null}
      {children}
      {trailingIcon ? (
        <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
          {trailingIcon}
        </span>
      ) : null}
    </button>
  );
}
