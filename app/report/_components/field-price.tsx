"use client";

import { useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
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
  // 2026-08-21 재실측 (F04-1_야채 제보_입력완료 `report-form-price` 1183:24038):
  //   상태 "입력됨" 은 값과 단위가 **한 덩어리 텍스트**다 — "1,000원" 전체가
  //   body/16-semibold · content/primary 이고 왼쪽 정렬이다.
  //   상태 "플레이스홀더" 는 "가격을 입력해 주세요" body/16-medium · content/disabled 이고
  //   **단위 글자가 없다.**
  //
  // UI QA 2026-08-20 #35("상태가 디자인과 다름")를 08-20에는 focus 테두리로만 처리했는데,
  // 실제 어긋남은 여기였다: `suffix`를 `flex-1` 입력 뒤에 두어 "원"이 **박스 오른쪽 끝까지
  // 밀려나 있었고**, 굵기·색도 body/16-medium content/secondary로 값과 달랐다.
  //   → 입력칸을 내용 폭으로 줄여(보이지 않는 mirror 텍스트가 폭을 정한다) 단위가 숫자
  //     바로 뒤에 붙게 하고, 값이 없을 때는 단위를 렌더하지 않는다.
  //
  // ⚠️ mirror 방식은 **단위가 붙는 칸에서만** 쓴다. 단위가 없는 「양」 칸까지 내용 폭으로
  //    줄이면 안내문구가 "1" 한 글자라 입력칸이 8px짜리가 되고 나머지 박스가 죽는다.
  const inputRef = useRef<HTMLInputElement>(null);
  const text = rest.value === undefined || rest.value === null ? "" : String(rest.value);
  const placeholder = typeof rest.placeholder === "string" ? rest.placeholder : "";
  const showSuffix = Boolean(suffix) && text.length > 0;

  if (!suffix) {
    return (
      <div className={cn(FIELD_BOX, "w-full focus-within:border-border-tertiary", className)}>
        <input
          className="min-w-0 flex-1 bg-transparent text-body-16-semibold text-content-primary outline-none placeholder:font-medium placeholder:text-content-disabled"
          {...rest}
        />
      </div>
    );
  }

  return (
    // 입력중(focus) 테두리 — Figma에 focus 심볼이 없어 border/tertiary를 쓴다. 브라우저 기본
    // 파란 링을 끈 자리를 메우는 표시이기도 하다(UI QA #45). border 폭은 1px 그대로라
    // 색만 바뀌고 레이아웃은 흔들리지 않는다.
    <div
      className={cn(FIELD_BOX, "w-full focus-within:border-border-tertiary", className)}
      // 입력칸이 내용 폭이라 박스 오른쪽에 빈 자리가 생긴다. 거기를 눌러도 입력이 시작되도록
      // 포커스를 넘긴다(누르는 곳이 곧 입력칸이라는 기대를 지킨다).
      onMouseDown={(event) => {
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        inputRef.current?.focus();
      }}
    >
      <span
        className="flex min-w-0 flex-1 items-center"
        onMouseDown={(event) => {
          if (event.target !== event.currentTarget) return;
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        {/*
          보이지 않는 mirror 텍스트가 칸 폭을 정하고, 입력은 그 위에 **absolute로 겹친다.**
          단위가 숫자 바로 뒤에 붙는 건 이 폭 계산이 정확해야 성립한다.

          ⚠️ 08-21에는 grid 1칸에 둘을 겹쳐 뒀는데 **"원"이 여전히 멀리 떨어졌다**(08-22 재신고).
             `min-w-0`은 min-content만 0으로 만들고 grid 열은 `max-content`로도 커지는데,
             `<input>`의 max-content는 `size` 기본값(≈20자 ≈ 170px)이라 "300" 같은 짧은 값에서
             열이 170px까지 벌어졌다. 입력을 absolute로 빼면 폭 계산에 아예 참여하지 않는다.
          (`field-sizing: content`는 아직 브라우저 편차가 커서 쓰지 않았다)
        */}
        <span className="relative max-w-full min-w-0 overflow-hidden">
          <span aria-hidden="true" className="invisible block whitespace-pre text-body-16-semibold">
            {/* 값도 안내문구도 없으면 높이가 0이 되므로 공백 한 칸으로 줄 높이를 지킨다. */}
            {text || placeholder || "\u00a0"}
          </span>
          <input
            ref={inputRef}
            className="absolute inset-0 w-full min-w-0 bg-transparent text-body-16-semibold text-content-primary outline-none placeholder:font-medium placeholder:text-content-disabled"
            {...rest}
          />
        </span>
        {/*
          QA-V3 #3 (2026-08-22): 08-21에 단위를 숫자 뒤로 당겨붙였는데 디자이너가
          `field/price` state=typing(1332:30211)을 근거로 **"숫자와 약간의 gap"**을 요청했다 —
          그 노드는 캐럿(1px indicator) 바로 뒤에 "원"이 오는 구조라 실제 화면에서는
          숫자와 단위 사이에 캐럿 한 칸만큼 틈이 생긴다. 우리 입력칸은 캐럿이 mirror 폭
          안쪽에 있어 그 틈이 0이 되므로 **2px을 명시적으로 준다.**
          (Figma에 gap 값 자체는 없다 — 캐럿 폭에서 온 2px 추정이라 값이 다르면 알려달라)
        */}
        {showSuffix ? (
          <span className="ml-0.5 shrink-0 text-body-16-semibold text-content-primary">
            {suffix}
          </span>
        ) : null}
      </span>
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

export const REPORT_UNIT_OPTIONS = ["kg", "g", "개", "포기"] as const;
export type ReportUnit = (typeof REPORT_UNIT_OPTIONS)[number];

export interface FieldUnitDisplayProps {
  unit?: ReportUnit;
  onChange: (unit: ReportUnit) => void;
  className?: string;
}

/**
 * Figma `field/unit-select` — 364:8167. 양 입력 오른쪽의 단위 선택.
 *
 * 실측: 같은 박스 + justify-between · **w-[124px] 고정** ·
 *       라벨 body/16-**medium** content/primary(입력값과 굵기가 다르다)
 *
 * 품목의 기본 단위가 있어도 사용자가 kg·g·개·포기 중 제보 단위를 선택할 수 있다.
 */
export function FieldUnitDisplay({
  unit,
  className,
  onChange,
}: FieldUnitDisplayProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative w-31 shrink-0", className)}>
      <button
        type="button"
        className={cn(
          FIELD_BOX,
          "w-full justify-between gap-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary",
        )}
        aria-label={unit ? `제보 단위 ${unit}` : "제보 단위 선택"}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={cn("whitespace-nowrap text-body-16-medium", unit ? "text-content-primary" : "text-content-disabled")}>
          {unit ?? "단위 선택"}
        </span>
        <FigmaIcon name="chevron-down" width={16} currentColor className="text-content-secondary" />
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label="제보 단위"
          className="absolute inset-x-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-lg bg-surface-primary py-1 shadow-dropdown"
        >
          {REPORT_UNIT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={unit === option}
              className={cn(
                "flex w-full items-center px-4 py-2 text-left text-body-14-medium text-content-primary",
                unit === option && "bg-surface-secondary",
              )}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
