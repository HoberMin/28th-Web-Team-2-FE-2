import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `button/cta` — Design Library node 160-2855 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-05.
// Variant(Primary·Secondary·Tertiary) × State(Normal·Pressed·Disabled) = 9종.
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

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3 text-body-16-semibold";

export type ButtonVariant = "primary" | "secondary" | "tertiary";

/** Figma State 축. 기본 `normal`이면 눌림은 `:active`로 자동 적용된다. */
export type ButtonState = "normal" | "pressed";

const NORMAL: Record<ButtonVariant, string> = {
  primary:
    "bg-action-primary-default text-content-inverse active:bg-action-primary-pressed disabled:bg-action-primary-disabled",
  secondary:
    "bg-action-secondary-default text-content-inverse active:bg-content-secondary disabled:bg-action-secondary-disabled",
  tertiary:
    "bg-action-tertiary-default text-content-secondary active:bg-action-tertiary-pressed disabled:bg-action-tertiary-disabled",
};

// `state="pressed"`로 눌린 모습을 고정할 때 쓰는 세트 — 배경만 pressed 값으로 바꾼다.
// NORMAL과 배타적으로 적용해 같은 속성이 두 클래스로 겹치지 않게 한다(cn 주석 참고).
const PRESSED: Record<ButtonVariant, string> = {
  primary:
    "bg-action-primary-pressed text-content-inverse disabled:bg-action-primary-disabled",
  secondary: "bg-content-secondary text-content-inverse disabled:bg-action-secondary-disabled",
  tertiary:
    "bg-action-tertiary-pressed text-content-secondary disabled:bg-action-tertiary-disabled",
};

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  state?: ButtonState;
  /** Figma의 Leading Icon 슬롯(16×16). 비우면 아이콘 없이 렌더된다. */
  leadingIcon?: ReactNode;
  /** Figma의 Trailing Icon 슬롯(16×16). */
  trailingIcon?: ReactNode;
}

export function Button({
  variant = "primary",
  state = "normal",
  leadingIcon,
  trailingIcon,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(BASE, state === "pressed" ? PRESSED[variant] : NORMAL[variant], className)}
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
