"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/app/_lib/cn";
import { FigmaIcon } from "@/app/_lib/figma-asset";

// 실측 출처: 장보고 Design `d5j7K9BNpSXxVUu3fmZfY4` / `화면GUI(원본)` 364:6742 — 상세는 `app/report/page.tsx` 머리말.

// Figma `field/price` — 화면GUI(원본) 컴포넌트 세트 364:6687 / 6693 / 6695, sync 2026-08-13.
//
// Figma의 state 축 3종을 실측했다(364:8145 get_design_context):
//   placeholder         justify-between · body/16-medium   · content/disabled  ("가격을 입력해 주세요")
//   entered             flex-1          · body/16-semibold · content/primary   ("1")
//   vegetable-selected  gap-[8px]       · body/16-semibold · content/primary + 우측 액션 그룹
//                       액션 그룹 = gap-[4px] · 라벨 body/14-medium content/secondary + icon/chevron-right 16
//
// 공통 박스: bg surface/primary · border border/primary 1px · px-[16px] py-[12px] · radius/lg
//            → 높이는 hug: 12 + 25(16px×1.55) + 12 + 테두리 2 = **51px** (XML 실측과 일치)
//
// ⚠️ **Figma가 서로 다른 역할에 같은 `field/price` 하나를 쓰고 있다** —
//    · 실제 입력(가격 · 양)          → `<input>`이어야 한다
//    · 다른 화면으로 이동(제보 품목 · 판매 장소) → 링크/버튼이어야 한다
//    이름도 `field/price`인데 품목·장소에도 쓰인다. 마크업이 근본적으로 갈리는 자리라
//    **코드에서는 `FieldInput`과 `FieldSelect`로 나눴다.** 박스 스타일만 공유한다.
//    (GUI피드백.md에 기록 — 컴포넌트를 쪼갤지 디자이너 확인 필요)
//
// ⚠️ Figma에 focus·error·disabled 상태가 없다. 브라우저 기본 포커스 링을 지우지 않고 그대로 둔다
//    (지우면 WCAG 2.4.7 위반). 임의로 error 스타일을 만들지 않았다.

/**
 * 세 state가 공유하는 박스. 높이는 내용이 결정한다(Figma도 hug).
 *
 * ⚠️ **폭은 여기에 넣지 않는다.** 예전엔 `w-full`이 이 상수에 있었는데,
 *    `FieldUnitDisplay`가 그 위에 `w-31`을 얹으면서 한 요소에 `w-full`과 `w-31`이
 *    동시에 붙었다. `cn`은 tailwind-merge가 아니라 단순 join이라(`app/_lib/cn.ts`)
 *    충돌이 해소되지 않고, 승자는 클래스 나열 순서가 아니라 **생성된 CSS 순서**가 정한다
 *    — 즉 Tailwind 내부 순서에 따라 단위 박스가 124px가 될 수도, 358px가 될 수도 있었다.
 *    (2026-08-19 "양 입력칸과 단위칸 너비가 이상하다" 신고의 원인)
 *    폭은 각 컴포넌트가 자기 것만 선언한다.
 */
const FIELD_BOX =
  "flex items-center rounded-lg border border-border-primary bg-surface-primary px-4 py-3";

/** Figma `vegetable-selected`의 우측 액션 그룹 — 라벨 + chevron. */
function FieldAction({ label }: { label: string }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      <span className="whitespace-nowrap text-body-14-medium text-content-secondary">{label}</span>
      {/* UI QA 2026-08-20 #34: chevron 색이 디자인과 달랐다 → 라벨과 같은 content/secondary. */}
      <FigmaIcon name="chevron-right" width={16} currentColor className="text-content-secondary" />
    </span>
  );
}

export interface FieldInputProps extends ComponentPropsWithoutRef<"input"> {
  className?: string;
  suffix?: ReactNode;
}

/**
 * 실제 값을 입력하는 자리(가격 · 양). Figma state `placeholder` ↔ `entered`는
 * 별도 prop이 아니라 **값이 있냐 없냐**로 갈린다 — placeholder는 브라우저가 그린다.
 *
 * Figma placeholder는 body/16-medium content/disabled, 입력값은 body/16-**semibold**
 * content/primary다. 굵기가 바뀌므로 `placeholder:` 변형으로 둘을 한 요소에 태운다.
 */
export function FieldInput({ className, suffix, ...rest }: FieldInputProps) {
  return (
    // 입력중(focus) 상태의 테두리는 Figma `field/price` "상태: 입력중"(F04-1 444:24594)이
    // border/tertiary로 잡아 둔 값이다 — UI QA 2026-08-20 #35("상태가 디자인과 다름").
    // 동시에 #45("모든 텍스트필드 선택 시 파란 스트로크")도 여기서 해소된다: 브라우저 기본
    // 파란 링(outline)을 끄고 디자인 토큰 테두리로 대체한다. border 폭은 그대로 1px이라
    // 색만 바뀌고 레이아웃은 흔들리지 않는다.
    <div className={cn(FIELD_BOX, "w-full focus-within:border-border-tertiary", className)}>
      <input
        className="min-w-0 flex-1 bg-transparent text-body-16-semibold text-content-primary outline-none placeholder:font-medium placeholder:text-content-disabled"
        {...rest}
      />
      {suffix ? (
        <span className="shrink-0 text-body-16-medium text-content-secondary">{suffix}</span>
      ) : null}
    </div>
  );
}

export interface FieldSelectProps {
  /** 고른 값. 예: "오이", "제일마트 성수점" */
  value: string;
  /** 우측 액션 라벨. Figma는 자리마다 다르다 — "다시 선택" / "위치 변경" */
  actionLabel: string;
  /** 이동할 화면. Figma 개발 주석이 이동 대상을 지정한 자리다. */
  href: string;
  /** 스크린리더용 설명. 예: "제보 품목 오이, 다시 선택" */
  ariaLabel: string;
  className?: string;
}

/**
 * 값을 고르러 다른 화면으로 이동하는 자리(제보 품목 · 판매 장소).
 *
 * Figma 개발 주석:
 *   제보 품목(364:8159) — "클릭 시 F04-2_야채 카테고리로 이동"
 *   제보 품목 블록(364:8157) — "F03_야채시세 상세의 '우리 동네 가격 제보하기' 버튼 클릭 시
 *                              다음과 같이 세팅됨 (ex. F03이 오이 화면이면 오이 자동세팅)"
 */
export function FieldSelect({
  value,
  actionLabel,
  href,
  ariaLabel,
  className,
}: FieldSelectProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        FIELD_BOX,
        "w-full gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary",
        className,
      )}
    >
      <span className="min-w-0 flex-1 truncate text-body-16-semibold text-content-primary">
        {value}
      </span>
      <FieldAction label={actionLabel} />
    </Link>
  );
}

export interface FieldUnitDisplayProps extends ComponentPropsWithoutRef<"div"> {
  /** 품목 API의 defaultUnit 원문. 예: "1kg", "100g", "1개", "1포기". */
  unit: string;
}

/**
 * Figma `field/unit-select` — 364:8167. 양 입력 오른쪽의 단위 표시.
 *
 * 실측: 같은 박스 + justify-between · **w-[124px] 고정** ·
 *       라벨 body/16-**medium** content/primary(입력값과 굵기가 다르다)
 *
 * Spring 제보 저장은 `unit`이 품목의 `defaultUnit`과 문자열까지 같아야 한다. 따라서
 * `1kg`을 `kg`으로 줄이거나 다른 단위로 바꾸지 않고 API 원문을 그대로 표시한다.
 *
 * ── 2026-08-19 재실측 (node 429:18069 · 구 364:8167은 파일 재생성으로 소멸) ──────
 *  · 폭 124 · gap 4 · px-16 py-12 · radius/lg · 라벨 body/16-medium content/primary ·
 *    icon/chevron-down 16 — **위 실측값이 지금도 전부 맞다.**
 *  · API 계약상 단위를 선택할 수 없어 chevron은 렌더하지 않는다.
 */
export function FieldUnitDisplay({
  unit,
  className,
  ...rest
}: FieldUnitDisplayProps) {
  return (
    <div className={cn(FIELD_BOX, "w-31 shrink-0", className)} {...rest}>
      <span className="whitespace-nowrap text-body-16-medium text-content-primary">{unit}</span>
    </div>
  );
}
