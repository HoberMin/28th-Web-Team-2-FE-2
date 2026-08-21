import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../_lib/cn";
import { FigmaIcon } from "../_lib/figma-asset";
import { LoadingCircular } from "./loading-circular";

// Figma `button/cta_md` — Design Library node 160-2855 (fileKey WfW1Nkx1oiOWBHNwrw48IL).
// sync 2026-08-05 → 재sync 2026-08-06: size(medium·small) 축 + variant `outlined` 추가.
//              → **재sync 2026-08-08: state `loading` 추가.**
// 지금 Figma 프레임엔 심볼 **28개**: Variant(Primary·Secondary·Tertiary·Outlined) ×
// Size(Medium·Small) × State(Normal·Pressed·Disabled·Loading, outlined는 Normal·Loading만).
//   primary/secondary/tertiary  4 state × 2 size = 24
//   outlined                    2 state × 2 size = 4
//
// ⚠️ 2026-08-06 sync 때는 small에 normal 심볼밖에 없었는데, 이번에 다시 읽어 보니
//    **small에도 pressed·disabled가 생겼다**(예: primary small pressed 436-25249 ·
//    disabled 436-25261, secondary 436-25273·25285, tertiary 436-25297·25309).
//    코드는 원래부터 size와 무관하게 state를 지원하고 있어 구현 변경은 없고,
//    `/playground` 스토리에서 "small은 normal뿐"이라고 좁혀 두었던 목록만 넓혔다.
//
// Figma의 State 축은 코드에서 이렇게 나뉜다:
//   Normal   → 기본
//   Pressed  → `:active` (CSS가 자동 처리)   + 갤러리 고정용 `state="pressed"`
//   Disabled → 네이티브 `disabled` 속성 (`disabled:` 변형)
//   Loading  → `state="loading"` (아래 별도 설명)
// hover는 Figma에 정의가 없어 만들지 않았다 (임의 추가 금지).
//
// ⚠️ Secondary의 pressed 배경은 Figma가 `action-secondary/pressed`(gray-700)가 아니라
//    `content/secondary`(gray-600)에 바인딩해 두었다. 원본 그대로 옮겼다 —
//    시맨틱상 어색하므로 Figma에서 의도한 값인지 확인이 필요하다.
//
// ⚠️ `outlined`는 Figma에 normal·loading 심볼만 있다(normal: medium 390-20833 · small 417-23114,
//    loading: medium 436-25784 · small 436-25796) — pressed·disabled 심볼이 없어서 만들지 않았다.
//    `state="pressed"`나 네이티브 `disabled`를 넘겨도 outlined는 항상 normal 스타일로 렌더된다.
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
//
// ── loading (2026-08-08 신규) ────────────────────────────────────────────────
// Figma 심볼 8개를 get_design_context로 실측: medium 436-25334(primary)·25650(secondary)·
// 25664(tertiary)·25784(outlined), small 436-25678·25684·25690·25796.
//
// 실측에서 확인한 것:
//   1) **배경·테두리·패딩·radius는 normal과 완전히 동일하다.** 예를 들어 primary medium loading은
//      `bg action-primary/default` + `px-28 py-12` + `radius/lg` — normal과 같은 값이다.
//      즉 loading은 색 상태가 아니라 "내용만 바뀌는" 상태다.
//   2) 라벨은 사라지지 않고 **마스크로 가려진다**(Figma가 mask-size의 높이를 0으로 export).
//      레이아웃 상자는 남아 있어서 버튼 크기가 로딩 전후로 흔들리지 않는다.
//      → 코드에서는 라벨 래퍼에 `invisible`을 걸어 같은 효과를 낸다(자리는 차지하고 안 보임).
//   3) 스피너는 그 상자 위에 **절대배치로 가운데** 얹힌다(Figma: Loading 레이어가 inset-0 + center).
//   4) 스피너 색은 variant별로 다르지만 **언제나 그 variant의 글자색과 같다** — 심볼 4종을 렌더로
//      대조해 확인했다(primary·secondary=밝은 색, tertiary·outlined=어두운 색). 그래서 색을 따로
//      매핑하지 않고 LoadingCircular의 `currentColor`가 버튼의 text color를 그대로 상속하게 뒀다.
//      Figma에 스피너 색 Variable 바인딩이 없어(빈 응답) 임의 hex를 만들지 않으려는 목적도 있다.
//
// a11y — Figma에 정의가 없어 코드 판단으로 채운 부분(시각에는 영향 없음):
//   `aria-busy="true"`로 진행 중임을 알리고, `aria-disabled="true"` + **onClick을 넘기지 않는 것**으로
//   중복 제출을 막는다.
//   네이티브 `disabled`를 쓰지 않는 이유: 그러면 `disabled:bg-action-*-disabled`가 발동해 배경이
//   회색으로 바뀌는데, Figma의 loading 심볼은 **normal과 같은 배경**이라 원본과 어긋나기 때문이다.
//   `aria-disabled`는 포커스를 유지해서 로딩 중 버튼을 잃어버리지 않는 이점도 있다.
//
//   ⚠️ onClick을 `undefined`로 **떨어뜨리는** 방식이지 preventDefault로 삼키는 방식이 아니다.
//      이 컴포넌트는 Server Component에서도 렌더돼야 해서(conventions #10) 여기서 새 함수를
//      만들 수 없기 때문이다 — 실제로 처음엔 preventDefault 핸들러를 넣었다가
//      "Event handlers cannot be passed to Client Component props"로 /playground 프리렌더가
//      깨졌다(2026-08-08 빌드에서 확인).
//      부작용: `type="submit"`로 폼 안에 놓인 버튼은 로딩 중에도 브라우저 기본 동작으로 제출된다.
//      제출까지 막아야 하면 호출부가 `disabled`를 함께 넘긴다. 이때 **배경은 회색으로 바뀌지 않는다** —
//      아래 LOADING 클래스에는 `disabled:` 변형이 없어서 loading 배경(=normal과 같은 색)이 그대로
//      유지된다. Figma의 loading 심볼이 normal 배경이라 일부러 그렇게 뒀다.

const BASE = "relative inline-flex items-center justify-center";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "outlined";
export type ButtonSize = "medium" | "small";

/** Figma State 축. 기본 `normal`이면 눌림은 `:active`로 자동 적용된다. pressed는 outlined엔 적용되지 않는다. */
export type ButtonState = "normal" | "pressed" | "loading";

/** 색 상태가 있는 3종(primary·secondary·tertiary) 전용 타입 — outlined는 아래에서 별도 처리한다. */
export type ColorVariant = "primary" | "secondary" | "tertiary";

/** 레이아웃(패딩)만. gap은 내용 래퍼가 들고 있다 — loading일 때 래퍼째 숨기기 위함. */
const SIZE: Record<ButtonSize, string> = {
  medium: "px-7 py-3",
  small: "px-5 py-2",
};

/**
 * radius는 size에서 분리돼 있다.
 *
 * Figma의 `button/base`(F01 홈 「더보기/닫기」 429:16757)가 **medium 패딩 + radius/md** 조합을
 * 쓰는데, 예전엔 호출부가 `className="rounded-md"`로 덮으려 했다. 그건 안 먹는다 —
 * `cn`은 tailwind-merge가 아니라 단순 join이고, `rounded-md`/`rounded-lg`는 같은 속성이라
 * 승자가 `@theme` 선언 순서(--radius-md가 먼저 → rounded-lg가 뒤에 emit → lg가 이김)로 정해진다.
 * (UI QA 2026-08-20 #7의 radius 부분이 그래서 화면에 반영되지 않았다 — 2026-08-21 교정)
 */
export type ButtonRadius = "md" | "lg";

const RADIUS: Record<ButtonRadius, string> = {
  md: "rounded-md",
  lg: "rounded-lg",
};

const DEFAULT_RADIUS: Record<ButtonSize, ButtonRadius> = {
  medium: "lg",
  small: "md",
};

const GAP: Record<ButtonSize, string> = {
  medium: "gap-2",
  small: "gap-1",
};

const TEXT: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: { medium: "text-body-16-semibold", small: "text-body-14-semibold" },
  secondary: { medium: "text-body-16-semibold", small: "text-body-14-semibold" },
  tertiary: { medium: "text-body-16-semibold", small: "text-body-14-semibold" },
  outlined: { medium: "text-body-16-semibold", small: "text-body-14-medium" },
};

// ⚠️ Figma가 **secondary의 pressed 배경만 size마다 다른 토큰**에 바인딩해 두었다
//    (medium 477-5174 → `content/secondary` gray-600 #697383 /
//     small  477-5069 → `action-secondary/pressed` gray-700 #4a5667).
//    시맨틱상 둘 다 action-secondary/pressed여야 자연스럽지만 원본을 그대로 옮긴다(figma-bridge §4).
//    2026-08-08 이전 코드는 medium 값(content/secondary)을 두 size에 함께 쓰고 있어서
//    **small이 Figma와 달랐다** — 이번에 size별로 갈랐다.
//    디자이너가 "둘 다 action-secondary/pressed"로 정리해 주면 이 두 맵은 지우고 합칠 수 있다.
//    (Tailwind가 클래스 문자열을 정적으로 스캔하므로 `active:${...}` 조립 대신 리터럴로 둔다.)
const SECONDARY_PRESSED_BG: Record<ButtonSize, string> = {
  medium: "bg-content-secondary",
  small: "bg-action-secondary-pressed",
};

const SECONDARY_ACTIVE_BG: Record<ButtonSize, string> = {
  medium: "active:bg-content-secondary",
  small: "active:bg-action-secondary-pressed",
};

const NORMAL: Record<ColorVariant, string> = {
  primary:
    "bg-action-primary-default text-content-inverse active:bg-action-primary-pressed disabled:bg-action-primary-disabled",
  // secondary의 active 배경은 size 의존이라 아래 SECONDARY_ACTIVE_BG가 따로 붙인다.
  secondary:
    "bg-action-secondary-default text-content-inverse disabled:bg-action-secondary-disabled",
  tertiary:
    "bg-action-tertiary-default text-content-secondary active:bg-action-tertiary-pressed disabled:bg-action-tertiary-disabled",
};

// `state="pressed"`로 눌린 모습을 고정할 때 쓰는 세트 — 배경만 pressed 값으로 바꾼다.
// NORMAL과 배타적으로 적용해 같은 속성이 두 클래스로 겹치지 않게 한다(cn 주석 참고).
const PRESSED: Record<ColorVariant, string> = {
  primary:
    "bg-action-primary-pressed text-content-inverse disabled:bg-action-primary-disabled",
  // 배경은 size 의존이라 SECONDARY_PRESSED_BG가 따로 붙인다.
  secondary: "text-content-inverse disabled:bg-action-secondary-disabled",
  tertiary:
    "bg-action-tertiary-pressed text-content-secondary disabled:bg-action-tertiary-disabled",
};

// loading은 Figma상 배경이 normal과 같다 — 다만 `:active`·`disabled:` 변형은 떼어 낸다.
// 로딩 중에는 눌러도 반응하지 않아야 하고(그게 aria-disabled의 뜻), 회색 disabled 배경으로
// 넘어가서도 안 되기 때문이다.
const LOADING: Record<ColorVariant, string> = {
  primary: "bg-action-primary-default text-content-inverse",
  secondary: "bg-action-secondary-default text-content-inverse",
  tertiary: "bg-action-tertiary-default text-content-secondary",
};

// outlined는 상태 축이 없어 NORMAL/PRESSED/LOADING 밖에 고정 클래스로 둔다.
// 대비 참고: content/secondary(#697383) on surface/primary(#fff) ≈ 4.79:1 (텍스트 AA 통과),
// border/primary(#e5e8ef) on 흰 배경 ≈ 1.23:1 (UI 컴포넌트 3:1 기준 미달) — Figma 원본 그대로 두고
// 스토리에 미달 사실을 남긴다(임의로 진한 색으로 바꾸지 않음).
const OUTLINED = "bg-surface-primary text-content-secondary border border-border-primary";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
  /** 모서리. 기본은 size가 정한다(medium=lg 12px · small=md 8px). Figma가 조합을 섞어 쓰는 자리만 넘긴다. */
  radius?: ButtonRadius;
  /** Figma Boolean property. 기본값은 true다. */
  leading?: boolean;
  /** Figma의 Leading Icon 슬롯(16×16). 비우면 원본 기본 Shape를 렌더한다. */
  leadingIcon?: ReactNode;
  /** Figma Boolean property. 기본값은 true다. */
  trailing?: boolean;
  /** Figma의 Trailing Icon 슬롯(16×16). 비우면 원본 기본 Shape를 렌더한다. */
  trailingIcon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "medium",
  state = "normal",
  radius,
  leading = true,
  leadingIcon,
  trailing = true,
  trailingIcon,
  className,
  type = "button",
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const isLoading = state === "loading";

  const colorClasses =
    variant === "outlined"
      ? OUTLINED
      : isLoading
        ? LOADING[variant]
        : state === "pressed"
          ? PRESSED[variant]
          : NORMAL[variant];

  // secondary만 pressed 배경이 size에 따라 다르다 (위 SECONDARY_*_BG 주석 참고).
  // loading일 때는 눌림 표현 자체가 없으므로 붙이지 않는다.
  const secondaryPressedBg =
    variant === "secondary" && !isLoading
      ? state === "pressed"
        ? SECONDARY_PRESSED_BG[size]
        : SECONDARY_ACTIVE_BG[size]
      : null;

  return (
    <button
      type={type}
      className={cn(
        BASE,
        SIZE[size],
        RADIUS[radius ?? DEFAULT_RADIUS[size]],
        TEXT[variant][size],
        colorClasses,
        secondaryPressedBg,
        className,
      )}
      aria-busy={isLoading || undefined}
      aria-disabled={isLoading || undefined}
      onClick={isLoading ? undefined : onClick}
      {...rest}
    >
      {isLoading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <LoadingCircular animate currentColor />
        </span>
      ) : null}
      <span
        className={cn("inline-flex items-center justify-center", GAP[size], isLoading && "invisible")}
      >
        {leading ? (
          <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
            {leadingIcon ?? <FigmaIcon name="button-shape" width={16} currentColor />}
          </span>
        ) : null}
        {children}
        {trailing ? (
          <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
            {trailingIcon ?? <FigmaIcon name="button-shape" width={16} currentColor />}
          </span>
        ) : null}
      </span>
    </button>
  );
}
