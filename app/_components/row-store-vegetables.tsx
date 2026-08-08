import type { ReactNode } from "react";
import { BadgeMore } from "./badge-more";
import { ItemVegetable } from "./item-vegetable";
import { cn } from "../_lib/cn";

// Figma `row/store-vegetables` — Design Library node 185-2042 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 없음(단일 심볼). 한 가게가 파는 야채를 한 줄로 늘어놓고,
// 자리에 다 못 담으면 끝에 `badge/more`로 남은 개수를 알린다.
//
// get_design_context 실측:
//   루트   flex h-[86px] items-start justify-between w-[320px]
//          → items-start justify-between. 86px는 `min-h-21.5`로만 두고 고정하지 않는다
//            (야채 이름이 2줄이면 48+4+34 = 86px이 자연스럽게 나오고, 1줄뿐인 행도 같은 높이로
//             정렬돼야 목록에서 줄이 흔들리지 않는다). 320px는 Figma 프레임 폭이라 w-full로 따라간다.
//   자식   item/vegetable(185-1520) 5개 + badge/more(185-1912) 1개 — 둘 다 이미 구현돼 있어 재사용한다.
//          Figma 샘플이 5개일 뿐 개수는 고정이 아니라 `items` 배열로 받는다.
//
// 야채 그림은 ItemVegetable의 `visual` 슬롯으로 그대로 넘긴다. Figma 샘플 양파는 public에 export했다.

export interface RowStoreVegetablesItem {
  /** 야채 그림 슬롯(48×48). */
  visual: ReactNode;
  name: string;
}

export interface RowStoreVegetablesProps {
  items: RowStoreVegetablesItem[];
  /** 화면에 못 담은 나머지 개수. 0이거나 없으면 `badge/more`를 그리지 않는다. */
  moreCount?: number;
  className?: string;
}

export function RowStoreVegetables({ items, moreCount, className }: RowStoreVegetablesProps) {
  return (
    <div className={cn("flex min-h-21.5 w-full items-start justify-between", className)}>
      {items.map((item) => (
        <ItemVegetable key={item.name} visual={item.visual} name={item.name} />
      ))}
      {moreCount ? <BadgeMore count={moreCount} /> : null}
    </div>
  );
}
