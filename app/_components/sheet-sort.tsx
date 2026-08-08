"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `sheet/sort` — 화면GUI 파일(fileKey d5j7K9BNpSXxVUu3fmZfY4) F02 정렬시트 프레임 298-3546의
// 인스턴스 298-3575, 심볼 298:3309. sync 2026-08-08.
// ⚠️ 다른 `app/_components/*`와 달리 Design Library(WfW1Nkx1oiOWBHNwrw48IL)가 아니라 화면GUI 파일이
//    출처다 — 이 규격이 아직 라이브러리로 승격되지 않았다. 승격되면 node id를 갱신할 것.
//
// get_design_context 실측:
//   sheet/sort  w-[390px] bg surface/primary · rounded-t radius/3xl(24px)
//               pt-[8px] px-[16px] pb-[32px] · flex-col items-center gap-[16px]
//               → w-full(390은 모바일 화면 폭) · rounded-t-3xl · pt-2 px-4 pb-8 · gap-4
//               **그림자 없음.** 코드에 `--shadow-sheet`가 있지만 이 시트에는 붙지 않는다
//               (sheet/store-detail 전용). 높이도 고정하지 않는다 — 3옵션일 때 270px이 나올 뿐이다.
//   sheet/handle w-[40px] h-[4px] rounded radius/full · bg surface/secondary → w-10 h-1 rounded-full
//   content     flex-col items-start gap-[8px] w-full → gap-2
//   제목 "정렬"  title/18-semibold · content/primary
//   list        flex-col items-start w-[358px] → w-full (358 = 390 - px-16*2)
//   row         w-full flex items-center py-[16px] · border-b border/secondary
//               · body/16-medium · content/primary
//               선택 행만 gap-[4px] + 20×20 체크 아이콘(content/brand/light)
//
// Figma와 다르게 한 것 (근거 있는 이탈만):
//   · **마지막 행의 border-b를 뺐다.** 원본은 3번째 행 아래에도 선이 있는데, 그 아래가 pb-32
//     빈 여백이라 선이 허공에 떠 보인다(감사 지적).
//   · **행을 <button>으로 만들었다.** Figma의 row/sort-option은 div지만 실제로는 정렬을 고르는
//     조작이다. 선택 여부가 색·체크 모양에만 의존하지 않도록 `aria-pressed`를 함께 낸다
//     (FilterChip과 같은 패턴). py-4 + 24.8px 본문 = 약 57px이라 터치 타겟 44는 넉넉히 넘는다.
//   · 비선택 행에도 gap-1을 유지한다 — 두 번째 자식이 없어 시각 결과가 원본과 같다.
//
// ⚠️ 체크 아이콘(20×20)은 **슬롯**이다 — Figma 에셋 다운로드가 정책상 차단돼 있다
//    (figma-bridge §0-0). 넘기지 않으면 선택 표시가 `aria-pressed`로만 남으므로 호출부가
//    반드시 넣어야 한다. 색은 이 컴포넌트가 content/brand/light로 씌운다.
//
// ⚠️ Radix Dialog를 쓰라는 지시가 있었지만 이 레포에는 `@radix-ui/*`가 설치돼 있지 않고,
//    package.json은 이번 작업의 쓰기 범위 밖이다. 대신 **네이티브 `<dialog>` + showModal()**로
//    만들었다 — 포커스 트랩·Esc 닫기·`aria-modal`·top-layer·`::backdrop`이 브라우저에서 공짜로
//    나오므로 Radix가 주는 것과 같은 보장을 얻는다. Radix를 도입하면 이 래퍼만 갈아끼우면 된다.
//
// ⚠️ 대비: 핸들 surface/secondary(#f2f3f8) on surface/primary(#ffffff) = 1.11:1.
//    UI 요소 기준 3:1에 크게 미달이고 닫기 버튼도 없어, 시각적으로 "닫을 수 있다"는 신호가
//    거의 없다. Figma 원본 값을 그대로 유지하고 사실만 기록한다(임의로 색을 바꾸지 않는다).
//    본문 content/primary(#262f3c) on 흰 배경 13.51:1 → 통과.
//
// ⚠️ 모션·드래그 dismiss는 Figma에 정의가 없어 만들지 않았다. 스크림 탭 dismiss와 Esc는 켜 뒀다.

export interface SheetSortOption {
  /** URL 쿼리 등에 쓰는 값. */
  value: string;
  /** 화면 문구. */
  label: string;
}

export interface SheetSortPanelProps {
  /** 시트 제목. 기본값은 Figma 문구. */
  title?: string;
  options: readonly SheetSortOption[];
  /** 현재 선택된 옵션의 value. */
  value: string;
  onSelect: (value: string) => void;
  /** 선택 행의 20×20 체크 아이콘 슬롯. 색은 이 컴포넌트가 씌운다. */
  checkIcon?: ReactNode;
  /** 제목 요소 id — 시트 래퍼가 aria-labelledby로 참조할 때 넘긴다. */
  titleId?: string;
  className?: string;
}

/**
 * 시트 표면만 그리는 프레젠테이션 컴포넌트. 여닫는 동작 없이 그대로 쓸 수 있어
 * `/playground`에서 정지 화면으로 검증한다. 실제 화면에서는 `SheetSort`가 감싼다.
 */
export function SheetSortPanel({
  title = "정렬",
  options,
  value,
  onSelect,
  checkIcon,
  titleId,
  className,
}: SheetSortPanelProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-4 rounded-t-3xl bg-surface-primary px-4 pt-2 pb-8",
        className,
      )}
    >
      <span aria-hidden="true" className="h-1 w-10 shrink-0 rounded-full bg-surface-secondary" />
      <div className="flex w-full flex-col items-start gap-2">
        <p id={titleId} className="text-title-18-semibold text-content-primary">
          {title}
        </p>
        <div className="flex w-full flex-col">
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={option.value === value}
              onClick={() => onSelect(option.value)}
              className={cn(
                "flex w-full items-center gap-1 py-4 text-left text-body-16-medium text-content-primary",
                // 마지막 행 아래는 pb-8 여백이라 선을 긋지 않는다.
                index === options.length - 1 ? null : "border-b border-border-secondary",
              )}
            >
              <span>{option.label}</span>
              {option.value === value ? (
                <span
                  aria-hidden="true"
                  className="flex size-5 shrink-0 items-center justify-center text-content-brand-light"
                >
                  {checkIcon}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface SheetSortProps extends Omit<SheetSortPanelProps, "titleId" | "className"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 화면 아래에서 올라오는 정렬 시트. 네이티브 `<dialog open>`을 `showModal()`로 띄워
 * 포커스 트랩·Esc 닫기·`aria-modal`·스크림(`::backdrop`)을 브라우저에 맡긴다.
 */
export function SheetSort({ open, onOpenChange, ...panel }: SheetSortProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={() => onOpenChange(false)}
      // 스크림(::backdrop) 클릭은 dialog 요소 자신을 타깃으로 잡힌다 — 시트 내부 클릭과 구분된다.
      onClick={(event) => {
        if (event.target === dialogRef.current) onOpenChange(false);
      }}
      className="mx-0 mt-auto mb-0 w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-overlay-dim"
    >
      <SheetSortPanel {...panel} titleId={titleId} />
    </dialog>
  );
}
