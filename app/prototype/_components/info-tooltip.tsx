"use client";

import { type ReactNode, useId, useState } from "react";
import IconILowercaseSerifCircleLine from "@karrotmarket/react-monochrome-icon/IconILowercaseSerifCircleLine";

// 인포메이션 호버/탭 툴팁 — 라벨 옆 ⓘ 버튼, 열면 설명 말풍선. (Figma F03_야채 시세_인포메이션 툴팁)
// hover는 마우스 한정(pointerType 가드) — 터치는 click 토글만 타야 첫 탭에서 바로 열린다.
// 키보드: 포커스 시 노출 · Esc 닫기. 스크린리더: aria-describedby로 본문 연결.
//
// 배경·글자는 토큰이다. 이전엔 #4a5667 / #f9f9fb 를 박아뒀는데, 주석은 "gray/700"이라 했지만
// Seed의 gray-700은 #868b94 라서 근거가 어긋났다. 어두운 말풍선은 neutral-inverted 한 쌍이 맞다.

export function InfoTooltip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const tipId = useId();

  return (
    <span className="relative inline-flex items-center align-middle">
      <button
        type="button"
        aria-label={`${label} 안내`}
        aria-describedby={open ? tipId : undefined}
        onClick={() => setOpen((v) => !v)}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setOpen(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setOpen(false);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className="-my-1.5 inline-flex items-center justify-center rounded-full p-1.5 text-content-secondary hover:text-content-primary [&_svg]:size-4"
      >
        <IconILowercaseSerifCircleLine />
      </button>
      {open && (
        <span
          id={tipId}
          role="tooltip"
          className="absolute top-full left-0 z-20 mt-1.5 w-max max-w-56 rounded bg-surface-secondary px-2 py-1.5 text-caption-12-regular whitespace-normal text-content-inverse shadow-md"
        >
          {children}
        </span>
      )}
    </span>
  );
}
