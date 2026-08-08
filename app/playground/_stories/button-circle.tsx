"use client";

import { useState } from "react";
import {
  ButtonCircle,
  type ButtonCircleSize,
  type ButtonCircleState,
  type ButtonCircleVariant,
} from "../../_components/button-circle";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `button/circle` node 477-5182 (구 350-17885), 재sync 2026-08-08 — **size 축(36·48) 추가**.
// 이 스토리에서만 "use client" + useState로 실제 클릭 토글을 보여준다 — 인터랙션 소유는
// 스토리가 하고, ButtonCircle 자체는 서버에서도 렌더 가능한 순수 프레젠테이션 컴포넌트로
// 남긴다(conventions #10, "use client"는 정말 필요한 leaf에만).
//
// 하트 아이콘은 Figma 원본 SVG(`public/figma/design-library/icons/heart-*.svg`)를 쓴다 —
// 임시로 직접 그렸던 placeholder는 걷어냈다. 색은 ButtonCircle이 state에 따라 바꾸는 text color를
// 따라가야 하므로 `currentColor` 모드로 넘긴다.

function HeartOutlineIcon({ size = 24 }: { size?: number }) {
  return <FigmaIcon name="heart-stroke-regular" width={size} currentColor />;
}

function HeartFillIcon({ size = 24 }: { size?: number }) {
  return <FigmaIcon name="heart-fill" width={size} currentColor />;
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

// Figma 프레임의 심볼 **8개** 그대로 — stroke/fill × normal/pressed × 36/48.
// (2026-08-06 리뷰에서 stroke/normal 중복 렌더 + fill/pressed 누락을 고쳤고,
//  2026-08-08 재sync에서 size 축이 생겨 4 → 8개로 넓혔다.)
const SIZES: ButtonCircleSize[] = [48, 36];

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

      {SIZES.map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <p className="text-body-14-semibold text-content-primary">
            {size === 48 ? "큰 크기 (48px · 아이콘 24px)" : "작은 크기 (36px · 아이콘 20px)"}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {STATIC_COMBOS.map(({ variant, state, label }) => {
              const iconSize = size === 36 ? 20 : 24;

              return (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <ButtonCircle
                  variant={variant}
                  state={state}
                  size={size}
                  icon={
                    variant === "fill" ? (
                      <HeartFillIcon size={iconSize} />
                    ) : (
                      <HeartOutlineIcon size={iconSize} />
                    )
                  }
                  aria-label={`찜 아이콘 예시 (${size}px, ${label})`}
                />
                <span className="text-caption-12-regular text-content-secondary">{label}</span>
              </div>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-caption-12-regular text-content-secondary">
        그림자 흐림 정도가 크기마다 달라요 — 48px은 3px, 36px은 2.25px이에요.
      </p>
    </div>
  );
}

export const buttonCircleStory: Story = {
  id: "button-circle",
  title: "Button Circle",
  group: "컴포넌트",
  figma: "node 477-5182",
  description: "찜하기처럼 원형 아이콘 하나로 상태를 토글하는 버튼이에요. 크기 2가지.",
  Component: ButtonCircleStory,
};
