import type { ReactNode } from "react";
import { RowRecommendedStore, type RowRecommendedStoreProps } from "./row-recommended-store";
import { RowStoreVegetables, type RowStoreVegetablesItem } from "./row-store-vegetables";
import { cn } from "../_lib/cn";

// Figma `card/recommended-store` — Design Library node 185-2359 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 없음(단일 심볼). 추천 가게 카드 —
// 맨 위 row/recommended-store(185-2117) + 아래 row/store-vegetables(185-2042) + 바닥 장식 image/grass(185-1460).
//
// get_design_context 실측:
//   루트     radius/xl(16px) · pt-[20px] pb-[32px] px-[20px] · w-[358px]
//            → rounded-xl pt-5 pb-8 px-5 (358px는 프레임 폭이라 w-full)
//   content  flex-col gap-[12px] w-full → gap-3
//   grass    카드 바닥에 **absolute bottom-0 가운데 정렬**, h-[30px] w-[358px]
//            → absolute bottom-0 left-1/2 -translate-x-1/2
//   안쪽 두 줄은 이미 구현된 RowRecommendedStore·RowStoreVegetables를 그대로 재사용한다.
//
// 카드 하단 장식은 Figma 원본처럼 30px 높이로 겹쳐 배치한다. 풀 그림은 absolute라
// 콘텐츠 하단 여백을 별도로 늘리면 카드가 불필요하게 길어지므로, 루트의 pb-8(32px)을 유지한다.
//
// 카드 배경은 Variable 바인딩이 없는 Figma 원본 그라데이션이므로 토큰을 추정하지 않고,
// 루트 fill의 stop/transform을 그대로 SVG 에셋으로 export해 배경 이미지로 사용한다.
//
// ⚠️ 대비 — Figma 원본 그라데이션 값 기준:
//    (밝은 끝 #f7fff3 / 짙은 끝 #dbfbb9):
//      가게 이름 content/primary      13.22 ~ 11.91:1 → 통과
//      거리 content/secondary (16px)   4.69 ~ **4.23:1** → 짙은 끝에서 미달
//      요약 강조 content/brand/light   3.27 ~ **2.95:1** → 양쪽 다 미달 (14px 기준 4.5:1)
//      야채 이름 content/secondary(12px)      **4.23:1** → 미달
//    흰 배경일 때보다 나빠지는 조합들이라 원본 접근성 이슈로 기록한다.

export interface CardRecommendedStoreProps
  extends Omit<RowRecommendedStoreProps, "className"> {
  /** 아래 줄에 늘어놓을 야채들. */
  vegetables: RowStoreVegetablesItem[];
  /** 화면에 못 담은 나머지 야채 개수. */
  moreCount?: number;
  /** 바닥 장식 풀 그림(`ImageGrass`). 없으면 그리지 않는다. */
  grass?: ReactNode;
  className?: string;
}

export function CardRecommendedStore({
  vegetables,
  moreCount,
  grass,
  className,
  ...rowProps
}: CardRecommendedStoreProps) {
  return (
    <div
      className={cn(
        "bg-recommended-store relative flex w-full flex-col items-center overflow-hidden rounded-xl bg-cover px-5 pt-5",
        "pb-8",
        className,
      )}
    >
      <div className="flex w-full flex-col items-start gap-3">
        <RowRecommendedStore {...rowProps} />
        <RowStoreVegetables items={vegetables} moreCount={moreCount} />
      </div>
      {grass ? (
        <div className="absolute bottom-0 left-0 w-full">{grass}</div>
      ) : null}
    </div>
  );
}
