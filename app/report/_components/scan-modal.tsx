"use client";

import { useEffect, useRef } from "react";
import { FigmaIcon } from "@/app/_lib/figma-asset";

// 실측 출처: 장보고 Design `d5j7K9BNpSXxVUu3fmZfY4` / `화면GUI(원본)` 364:6742 — 상세는 `app/report/page.tsx` 머리말.

// Figma `scan-modal` — 화면GUI(원본) 364:8228 (F04-1_야채 제보 364:8201의 overlay), sync 2026-08-13.
//
// get_design_context 실측:
//   루트      bg surface/primary · radius/**3xl**(24) · overflow-clip · **262×302**
//   body      absolute 가운데 · top-[62px] · flex flex-col gap-[12px] items-center
//     아이콘  **120×120 · bg #e2e2e2** ← Figma에서도 회색 사각형 **placeholder**다(그림 없음)
//     문구    body/16-semibold · **text-black** (content/primary가 아니라 raw black)
//   progress  absolute 가운데 · top-[246px] · 230×6 · bg surface/secondary · radius/full
//     bar     left-0 right-[147px] → **83/230 = 36% 고정** · bg content/brand/light
//   close     absolute left-[206px] top-[8px] · 48×48 슬롯 안 32×32 원형 버튼(8,8)
//
// ⚠️ Figma에서도 아이콘이 placeholder(#e2e2e2 사각형)라 **그 회색 사각형을 그대로 옮겼다** —
//    이건 "에셋 누락"이 아니라 시안의 현재 상태다. 그림이 확정되면 `icon` 슬롯에 넣는다.
//    `#e2e2e2`는 팔레트에 없는 raw hex다(gray/200 #e5e8ef과 가깝지만 다름) → placeholder라
//    토큰을 억지로 물리지 않고 `surface/secondary`로 뒀다. 어차피 대체될 자리다.
//
// ⚠️ **진행률이 36%로 고정돼 있고 완료·실패 상태가 Figma에 없다.** 스캔이 끝나면 어디로 가는지,
//    실패하면 무엇을 보여주는지 정의가 없다(GUI피드백.md에 기록).
//    → 코드는 진행률을 `progress` prop으로 열어 두고 기본값만 Figma와 같게 뒀다.
//
// ⚠️ 닫기 원형 버튼(364:6717 `button/close-circle-32`)의 `circle-bg` SVG를 받지 못했다.
//    실측이 "32px 원 + 안쪽 16px icon/close"라 레포의 `close.svg`로 조립했다 —
//    원 배경색은 Figma가 SVG 안에 담아 둬서 특정할 수 없어 `surface/secondary`로 뒀다.
//    (GUI피드백.md에 기록 — 원 배경 토큰 확인 필요)
//
// a11y — Figma에 정의가 없어 코드 판단으로 채운 부분:
//   role="dialog" + aria-modal + 진행률 aria-valuenow. 열릴 때 닫기 버튼에 포커스를 준다
//   (모달이 열렸는데 포커스가 뒤 화면에 남으면 스크린리더가 상태 변화를 놓친다).
//
//   ⚠️ `aria-modal="true"`를 선언한 이상 **뒤 콘텐츠가 실제로 도달 불가여야** 한다 —
//      안 그러면 보조기술 안내와 실제 동작이 어긋난다. 그래서 두 개를 직접 넣었다:
//        · Escape로 닫기
//        · 포커스 트랩 — 이 모달의 유일한 포커스 대상이 닫기 버튼 하나라, Tab을 어디로 눌러도
//          그 버튼으로 되돌린다(순회 목록을 만들 필요가 없다)
//      Radix `Dialog`로 감싸면 트랩·Escape·`aria-hidden`이 공짜지만, 그건 이 화면 로컬
//      컴포넌트에 새 의존성을 들이는 결정이라 컴포넌트 세션으로 넘긴다. 지금은 손으로 막았다.

export interface ScanModalProps {
  /** 진행률 0~100. Figma 시안은 36% 고정. */
  progress?: number;
  /** 진행 문구. Figma: "야채 인식 중.." */
  label?: string;
  /** 닫기. */
  onClose: () => void;
}

export function ScanModal({ progress = 36, label = "야채 인식 중..", onClose }: ScanModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Escape로 닫기 + 포커스 트랩. 포커스 대상이 닫기 버튼 하나뿐이라 Tab을 잡아 되돌리면 끝난다.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const clamped = Math.min(100, Math.max(0, progress));

  return (
    // 스크림: Figma의 overlay 프레임(364:8227)은 채움이 없어 뒤 화면이 그대로 보인다.
    // 다만 모달이 뜬 동안 뒤를 누르지 못해야 하므로 투명 레이어로 덮는다(색은 넣지 않았다 —
    // 시안에 없는 dim을 발명하면 정합이 깨진다).
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative h-75.5 w-65.5 overflow-hidden rounded-3xl bg-surface-primary"
      >
        <div className="absolute left-1/2 top-15.5 flex -translate-x-1/2 flex-col items-center gap-3">
          {/* Figma에서도 placeholder(120×120 회색 사각형)다 — 그림이 오면 이 자리를 바꾼다. */}
          <div className="size-30 bg-surface-secondary" aria-hidden="true" />
          <p className="whitespace-nowrap text-body-16-semibold text-content-primary">{label}</p>
        </div>

        <div
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="야채 인식 진행률"
          className="absolute left-1/2 top-61.5 h-1.5 w-57.5 -translate-x-1/2 overflow-hidden rounded-full bg-surface-secondary"
        >
          <div
            className="h-1.5 rounded-full bg-content-brand-light"
            style={{ width: `${clamped}%` }}
          />
        </div>

        <div className="absolute left-51.5 top-2 flex size-12 items-center justify-center">
          <button
            ref={closeRef}
            type="button"
            aria-label="야채 인식 취소"
            className="flex size-8 items-center justify-center rounded-full bg-surface-secondary"
            onClick={onClose}
          >
            <FigmaIcon name="close" width={16} currentColor className="text-content-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
