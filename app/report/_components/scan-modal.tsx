"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FigmaIcon } from "@/app/_lib/figma-asset";

// Figma `scan-modal` — Design Library 1082:10730 (F04-1_야채 제보의 overlay), sync 2026-08-19.
//
// get_design_context 실측:
//   루트      bg surface/primary · radius/**3xl**(24) · overflow-clip · **262×302**
//   body      absolute 가운데 · top-[48px] · flex flex-col items-center
//     아이콘  **132×132** 안에 실제 야채 일러스트가 노출된다
//     문구    body/16-semibold · **text-black** (content/primary가 아니라 raw black)
//   progress  absolute 가운데 · top-[246px] · 230×6 · bg surface/secondary · radius/full
//     bar     left-0 right-[147px] → **83/230 = 36% 고정** · bg content/brand/light
//   close     absolute left-[206px] top-[8px] · 48×48 슬롯 안 32×32 원형 버튼(8,8)
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

const SCAN_VEGETABLE_IMAGES = [
  "/veg/potato.svg",
  "/veg/sweet-potato.svg",
  "/veg/garlic.svg",
  "/veg/onion.svg",
  "/veg/carrot.svg",
  "/veg/tomato.svg",
  "/veg/bell-pepper.svg",
  "/veg/cucumber.svg",
  "/veg/red-pepper.svg",
  "/veg/broccoli.svg",
] as const;

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
  const [vegetableIndex, setVegetableIndex] = useState(0);

  // 인식 대기 중에는 Figma에 준비된 10종 일러스트를 0.5초마다 무작위로 교체한다.
  // 모달이 닫히면 컴포넌트가 언마운트되어 타이머도 함께 정리된다.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setVegetableIndex((current) => {
        let next = current;
        while (next === current) {
          next = Math.floor(Math.random() * SCAN_VEGETABLE_IMAGES.length);
        }
        return next;
      });
    }, 500);
    return () => window.clearInterval(intervalId);
  }, []);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-dim">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative h-75.5 w-65.5 overflow-hidden rounded-3xl bg-surface-primary"
      >
        <div className="absolute left-1/2 top-12 flex -translate-x-1/2 flex-col items-center">
          <div className="flex size-[132px] items-center justify-center" aria-hidden="true">
            <Image
              src={SCAN_VEGETABLE_IMAGES[vegetableIndex]}
              alt=""
              width={88}
              height={88}
              unoptimized
              className="size-[88px] object-contain"
            />
          </div>
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
