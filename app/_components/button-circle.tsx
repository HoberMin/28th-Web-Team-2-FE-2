import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `button/circle` — Design Library node 477-5182 (구 350-17885), fileKey WfW1Nkx1oiOWBHNwrw48IL.
// **재sync 2026-08-08: `size` 축(36·48)이 생겨 반영했다.** (registry.ts의 남은 이슈 ③ 해소)
// 흰 원(radius/full) + drop-shadow 안에 하트 등 아이콘 슬롯 하나.
//
// Figma 축은 style(stroke·fill) × state(normal·pressed) × size(36·48) = **8종**이고 8개 다 있다.
// size별 실측(get_design_context):
//   48 → size-[48px] · p-[12px] · 아이콘 24px · drop-shadow 0 0 **3px**    rgba(74,86,103,.22)
//   36 → size-[36px] · p-[8px]  · 아이콘 20px · drop-shadow 0 0 **2.25px** rgba(74,86,103,.22)
//   → 그림자 blur가 달라 `--shadow-floating`(48) / `--shadow-floating-sm`(36) 두 토큰을 쓴다.
//
// ⚠️ Figma의 stroke 아이콘(`icon/heart-stroke-regular`)만 **23×23px**이라 48px 심볼에서
//    12 + 23 + 12 = 47px로 1px 모자란다(다른 아이콘 17종은 전부 24×24). 명백한 아이콘 원본 오류라
//    코드는 24px 그리드(size-6)로 정규화했다 — 1px 어긋남을 코드로 복제하지 않는다. 디자이너 확인 항목.
//
// **색은 style이 아니라 state가 결정한다** — normal은 content/primary(#262f3c),
// pressed는 content/brand/light(#05a163). (get_variable_defs로 두 값 다 확인)
// style은 어떤 아이콘 글리프(외곽선 vs 채움)를 보여줄지만 정하고, 그 글리프 자체는 이 컴포넌트가
// 들고 있지 않다 (아래 아이콘 슬롯 설명 참고).
//
// 하트 원본 SVG는 `public/figma/design-library/icons/`에 export돼 있다. 다만 이 컴포넌트는 하트 외의
//    아이콘도 담을 수 있어 하드코딩하지 않고 `icon: ReactNode` 필수 슬롯으로 받는다. 아이콘은
//    `currentColor`를 쓰는 형태로 넘겨받는다고
//    가정하고, 이 컴포넌트가 wrapper의 text color를 state에 따라 바꿔서 아이콘 색이 자동으로
//    따라가게 한다(Button의 leadingIcon 래퍼 span과 같은 패턴).
//
// 대비 검산: content/primary(#262f3c) on 흰 배경 ≈ 13.5:1, content/brand/light(#05a163) on
// 흰 배경 ≈ 3.34:1 — 둘 다 아이콘 기준(3:1) 통과.
//
// Figma엔 disabled 심볼이 없어 만들지 않았다. 네이티브 `disabled` 속성은 그대로 클릭을 막지만
// 별도 색 처리는 없다.

const BASE =
  "inline-flex shrink-0 items-center justify-center rounded-full bg-surface-primary";

/** Figma의 style 축 — 어떤 아이콘 글리프(외곽선·채움)를 보여주는지 정보용. 색상엔 영향 없음. */
export type ButtonCircleVariant = "stroke" | "fill";
/** Figma State 축. 기본 `normal`이면 눌림은 `:active`로 자동 적용된다. */
export type ButtonCircleState = "normal" | "pressed";
/** Figma Size 축(px). 기본은 심볼 기본인 48. */
export type ButtonCircleSize = 36 | 48;

const COLOR: Record<ButtonCircleState, string> = {
  normal: "text-content-primary active:text-content-brand-light",
  pressed: "text-content-brand-light",
};

/** size별 원 크기 + 그림자. 아이콘 크기는 아래 ICON_SIZE가 따로 든다. */
const SIZE: Record<ButtonCircleSize, string> = {
  48: "size-12 shadow-floating",
  36: "size-9 shadow-floating-sm",
};

const ICON_SIZE: Record<ButtonCircleSize, string> = {
  48: "size-6",
  36: "size-5",
};

export interface ButtonCircleProps extends ComponentPropsWithoutRef<"button"> {
  /** Figma의 style 축(stroke·fill) — 어떤 아이콘 글리프를 보여줄지 caller가 판단하는 데 참고하는
   *  정보용 값이다. 렌더에는 영향 없다(색은 state가 결정). */
  variant?: ButtonCircleVariant;
  state?: ButtonCircleState;
  size?: ButtonCircleSize;
  /** Figma의 아이콘 슬롯(중앙). size=48이면 24×24, size=36이면 20×20으로 감싼다.
   *  currentColor를 쓰는 SVG를 넘겨받는다고 가정. 필수. */
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
  size = 48,
  icon,
  className,
  type = "button",
  ...rest
}: ButtonCircleProps) {
  return (
    <button type={type} className={cn(BASE, SIZE[size], COLOR[state], className)} {...rest}>
      <span
        aria-hidden="true"
        className={cn("flex shrink-0 items-center justify-center", ICON_SIZE[size])}
      >
        {icon}
      </span>
    </button>
  );
}
