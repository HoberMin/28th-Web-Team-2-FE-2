import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `row/recommended-store` — Design Library node 185-2117 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 없음(단일 심볼). 추천 가게 한 줄 — 이름 · 거리 · 저렴한 야채 개수 요약.
// `card/recommended-store`(185-2359)가 이걸 카드 맨 위에 얹는다.
//
// get_design_context 실측:
//   루트        border-b border/primary · h-[68px] · items-center justify-between · pb-[16px] · w-[320px]
//               → h-17 pb-4 border-b border-border-primary (320px는 프레임 폭이라 w-full)
//   info        flex-col gap-[4px] w-[260px] → gap-1 (260px는 프레임 폭이라 flex-1 min-w-0)
//   store 줄    flex gap-[6px] items-center → gap-1.5
//     아이콘    icon/store-fill 20×20 → size-5 슬롯
//     store-name flex gap-[4px] **items-end** → gap-1 items-end
//       이름    title/18-bold · content/primary · max-w-[168px] → max-w-42 · 한 줄 말줄임
//       거리    flex gap-[4px] items-center
//         dot   2×2 구분점
//         텍스트 body/16-medium · content/secondary · w-[56px] → w-14
//   summary     flex gap-[4px] items-center w-full
//     라벨      body/14-medium · content/secondary · w-[140px] → w-35
//     값        body/14-semibold · content/brand/light
//   chevron     icon/chevron-right 20×20 → size-5 슬롯
//
// 구분점(dot)은 2×2 SVG 에셋이라 색을 특정할 수 없다. 새 색을 고르는 대신 **옆 텍스트의 색을
// 그대로 쓰도록**(`bg-current`, 거리 묶음이 content/secondary를 들고 있다) 처리했다 —
// 임의 토큰 선택을 피하면서 원본과 가장 가깝다.
//
// 가게 아이콘과 chevron 원본은 public에 export했고, 행의 조합 가능성을 위해 슬롯은 유지한다.
//
// ⚠️ 프레젠테이션 전용이다. chevron이 이동을 암시하지만 Figma 심볼에 버튼·링크 정의가 없어
//    <a>·<button>으로 만들지 않았다. row/story와 같은 처리 — 호출부가 감싼다.
//
// ⚠️ 대비: 요약의 강조값 content/brand/light(#05a163) on 흰 배경 = **3.34:1** (14px 기준 4.5:1) → 미달.
//    Figma 원본 유지 + 사실만 기록(figma-bridge §4). 가게 이름 13.51:1 · 거리/라벨 4.79:1은 통과.

export interface RowRecommendedStoreProps {
  /** Figma의 icon/store-fill 슬롯(20×20). */
  storeIcon?: ReactNode;
  /** 가게 이름. 길면 한 줄에서 말줄임된다. */
  name: string;
  /** 거리 문자열. 예: "460m" */
  distance: string;
  /** 요약 라벨. 예: "공공 시세보다 저렴한 야채" */
  summaryLabel: string;
  /** 요약 강조값. 예: "12가지" */
  summaryValue: string;
  /** Figma의 icon/chevron-right 슬롯(20×20). */
  trailingIcon?: ReactNode;
  className?: string;
}

export function RowRecommendedStore({
  storeIcon,
  name,
  distance,
  summaryLabel,
  summaryValue,
  trailingIcon,
  className,
}: RowRecommendedStoreProps) {
  return (
    <div
      className={cn(
        "flex h-17 w-full items-center justify-between border-b border-border-primary pb-4",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <div className="flex w-full items-center gap-1.5">
          <span
            aria-hidden="true"
            className="flex size-5 shrink-0 items-center justify-center text-content-primary"
          >
            {storeIcon}
          </span>
          <div className="flex min-w-0 items-end gap-1">
            <p className="max-w-42 truncate text-title-18-bold text-content-primary">{name}</p>
            <div className="flex shrink-0 items-center gap-1 text-content-secondary">
              <span aria-hidden="true" className="size-0.5 shrink-0 rounded-full bg-current" />
              <p className="w-14 text-body-16-medium">{distance}</p>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center gap-1">
          <p className="w-35 shrink-0 text-body-14-medium text-content-secondary">{summaryLabel}</p>
          <p className="whitespace-nowrap text-body-14-semibold text-content-brand-light">
            {summaryValue}
          </p>
        </div>
      </div>
      <span
        aria-hidden="true"
        className="flex size-5 shrink-0 items-center justify-center"
      >
        {trailingIcon}
      </span>
    </div>
  );
}
