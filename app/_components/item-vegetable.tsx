import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `item/vegetable` — Design Library node 185-1520 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 없음(단일 심볼). 야채 그림 하나 + 이름 한 줄짜리 최소 단위.
// `row/store-vegetables`(185-2042)가 이걸 가로로 늘어놓는다.
//
// get_design_context 실측:
//   루트    flex-col gap-[4px] items-start w-[48px]  → w-12 flex-col gap-1
//   비주얼  "slot/visual" 48×48                      → size-12 슬롯
//   이름    caption/12-medium · content/secondary · text-center
//           max-h-[36px] · min-w-full                → max-h-9 (12px×1.45 = 17.4px → 정확히 2줄까지)
//
// Figma의 `slot/visual` 구조는 유지한다. 샘플의 image/vegetable-onion 원본은
// `public/figma/design-library/images/onion.png`에 export했다.
//
// 대비: content/secondary(#697383) on 흰 배경 = 4.79:1 → 12px 텍스트 AA(4.5:1) 통과.

export interface ItemVegetableProps {
  /** Figma `slot/visual`(48×48). 야채 그림을 넘긴다. */
  visual: ReactNode;
  /** 야채 이름. 길면 Figma와 같이 2줄까지 보이고 그 아래는 잘린다. */
  name: string;
  className?: string;
}

function VegetableName({ name }: { name: string }) {
  const characters = Array.from(name);
  if (characters.length !== 5) return <>{name}</>;

  return (
    <>
      {characters.slice(0, 3).join("")}
      <br />
      {characters.slice(3).join("")}
    </>
  );
}

export function ItemVegetable({ visual, name, className }: ItemVegetableProps) {
  return (
    <div className={cn("flex w-12 shrink-0 flex-col items-start gap-1", className)}>
      <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center">
        {visual}
      </span>
      <p className="max-h-9 min-w-full overflow-hidden text-center text-caption-12-medium text-content-secondary">
        <VegetableName name={name} />
      </p>
    </div>
  );
}
