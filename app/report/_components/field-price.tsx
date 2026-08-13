import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { cn } from "@/app/_lib/cn";
import { FigmaIcon } from "@/app/_lib/figma-asset";

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

/** 세 state가 공유하는 박스. 높이는 내용이 결정한다(Figma도 hug). */
const FIELD_BOX =
  "flex w-full items-center rounded-lg border border-border-primary bg-surface-primary px-4 py-3";

/** Figma `vegetable-selected`의 우측 액션 그룹 — 라벨 + chevron. */
function FieldAction({ label }: { label: string }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      <span className="whitespace-nowrap text-body-14-medium text-content-secondary">{label}</span>
      <FigmaIcon name="chevron-right" width={16} />
    </span>
  );
}

export interface FieldInputProps extends ComponentPropsWithoutRef<"input"> {
  className?: string;
}

/**
 * 실제 값을 입력하는 자리(가격 · 양). Figma state `placeholder` ↔ `entered`는
 * 별도 prop이 아니라 **값이 있냐 없냐**로 갈린다 — placeholder는 브라우저가 그린다.
 *
 * Figma placeholder는 body/16-medium content/disabled, 입력값은 body/16-**semibold**
 * content/primary다. 굵기가 바뀌므로 `placeholder:` 변형으로 둘을 한 요소에 태운다.
 */
export function FieldInput({ className, ...rest }: FieldInputProps) {
  return (
    <div className={cn(FIELD_BOX, className)}>
      <input
        className="min-w-0 flex-1 bg-transparent text-body-16-semibold text-content-primary placeholder:font-medium placeholder:text-content-disabled"
        {...rest}
      />
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
        "gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary",
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

export interface FieldUnitSelectProps extends ComponentPropsWithoutRef<"button"> {
  /** 현재 단위. 예: "kg" */
  unit: string;
}

/**
 * Figma `field/unit-select` — 364:8167. 양 입력 오른쪽에 붙는 단위 선택.
 *
 * 실측: 같은 박스 + justify-between · **w-[124px] 고정** ·
 *       라벨 body/16-**medium** content/primary(입력값과 굵기가 다르다) · icon/chevron-down 16
 *
 * ⚠️ 단위 선택 시트·목록이 Figma에 없다 — 누를 대상이 정의되지 않았다.
 *    지금은 버튼만 두고 동작을 붙이지 않았다(GUI피드백.md에 기록).
 *    124px는 고정 폭이 규격이라 그대로 옮겼다 — 양 입력이 flex-1로 남은 폭을 먹는다.
 */
export function FieldUnitSelect({ unit, className, type = "button", ...rest }: FieldUnitSelectProps) {
  return (
    <button
      type={type}
      className={cn(FIELD_BOX, "w-31 shrink-0 justify-between", className)}
      {...rest}
    >
      <span className="whitespace-nowrap text-body-16-medium text-content-primary">{unit}</span>
      <FigmaIcon name="chevron-down" width={16} />
    </button>
  );
}
