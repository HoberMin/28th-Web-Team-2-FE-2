"use client";

import { useState } from "react";
import {
  ButtonCircle,
  type ButtonCircleState,
  type ButtonCircleVariant,
} from "../../_components/button-circle";
import type { Story } from "./types";

// Figma `button/circle` node 350-17885, sync 2026-08-06. 신규 컴포넌트.
// 이 스토리에서만 "use client" + useState로 실제 클릭 토글을 보여준다 — 인터랙션 소유는
// 스토리가 하고, ButtonCircle 자체는 서버에서도 렌더 가능한 순수 프레젠테이션 컴포넌트로
// 남긴다(conventions #10, "use client"는 정말 필요한 leaf에만).
//
// ⚠️ 아래 하트 SVG는 Figma에서 가져온 진짜 아이콘이 아니라 임시 placeholder다. 에셋 다운로드가
// 정책상 차단돼 있어(figma-bridge §0-0) 인라인으로 직접 그렸다 — 디자이너가 실제 SVG를 주면
// 교체한다.

function HeartOutlineIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s-7.5-4.6-10-9.1C.6 8.6 2 5 5.5 5c2 0 3.4 1.1 4.5 2.6C11.1 6.1 12.5 5 14.5 5 18 5 19.4 8.6 22 11.9 19.5 16.4 12 21 12 21Z" />
    </svg>
  );
}

function HeartFillIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 21s-7.5-4.6-10-9.1C.6 8.6 2 5 5.5 5c2 0 3.4 1.1 4.5 2.6C11.1 6.1 12.5 5 14.5 5 18 5 19.4 8.6 22 11.9 19.5 16.4 12 21 12 21Z" />
    </svg>
  );
}

function LikeToggleDemo() {
  const [liked, setLiked] = useState(false);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <ButtonCircle
        variant={liked ? "fill" : "stroke"}
        state={liked ? "pressed" : "normal"}
        icon={liked ? <HeartFillIcon /> : <HeartOutlineIcon />}
        aria-label={liked ? "찜 취소" : "찜하기"}
        aria-pressed={liked}
        onClick={() => setLiked((prev) => !prev)}
      />
      <span className="text-caption-12-regular text-content-secondary">
        {liked ? "찜함 (눌러서 해제)" : "눌러서 찜하기"}
      </span>
    </div>
  );
}

// Figma 프레임의 심볼 4개 그대로 — stroke/fill × normal/pressed. (2026-08-06 리뷰에서 이 목록이
// stroke/normal을 중복 렌더하면서 fill/pressed를 빠뜨렸던 걸 발견해 고쳤다.)
const STATIC_COMBOS: {
  variant: ButtonCircleVariant;
  state: ButtonCircleState;
  label: string;
}[] = [
  { variant: "stroke", state: "normal", label: "stroke / normal" },
  { variant: "stroke", state: "pressed", label: "stroke / pressed" },
  { variant: "fill", state: "normal", label: "fill / normal" },
  { variant: "fill", state: "pressed", label: "fill / pressed" },
];

function ButtonCircleStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">실제 동작 데모</p>
        <p className="text-caption-12-regular text-content-secondary">눌러 보세요.</p>
        <LikeToggleDemo />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">여러 가지 모습</p>
        <div className="flex flex-wrap items-center gap-4">
          {STATIC_COMBOS.map(({ variant, state, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <ButtonCircle
                variant={variant}
                state={state}
                icon={variant === "fill" ? <HeartFillIcon /> : <HeartOutlineIcon />}
                aria-label={`찜 아이콘 예시 (${label})`}
              />
              <span className="text-caption-12-regular text-content-secondary">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const buttonCircleStory: Story = {
  id: "button-circle",
  title: "Button Circle",
  group: "컴포넌트",
  figma: "node 350-17885",
  description: "찜하기처럼 원형 아이콘 하나로 상태를 토글하는 버튼이에요.",
  Component: ButtonCircleStory,
};
