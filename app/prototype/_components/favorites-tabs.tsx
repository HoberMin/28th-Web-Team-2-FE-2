"use client";

// 찜 탭 본문 — 「야채」/「가게」 2탭. 탭 전환만 클라 상태고, 각 목록은 기존 화면 본문을 그대로 쓴다.
//
// 두 목록은 원래 마이페이지 하위 화면이었다(찜한 야채 F05-2 / 단골 가게 F05-5). 반복 구매가
// 타깃의 특성인데 되돌아올 경로가 마이페이지 2단 깊이에 묻혀 있어 GNB 탭으로 끌어올렸다.
// 두 목록의 성격이 달라(품목 그리드 vs 가게 리스트) 한 목록으로 합치지 않고 탭으로 나눈다.

import { useState } from "react";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import type { PriceMap } from "../_lib/stores";
import { FavoritesView } from "./favorites-view";
import { FavoriteStoresView } from "./favorite-stores-view";

type Tab = "vegetable" | "store";

export function FavoritesTabs({ priceMap }: { priceMap: PriceMap }) {
  const [tab, setTab] = useState<Tab>("vegetable");

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        value={tab}
        onValueChange={(next) => setTab(next as Tab)}
        aria-label="찜 목록 종류"
      >
        <SegmentedControlItem value="vegetable">야채</SegmentedControlItem>
        <SegmentedControlItem value="store">가게</SegmentedControlItem>
      </SegmentedControl>

      {tab === "vegetable" ? <FavoritesView priceMap={priceMap} /> : <FavoriteStoresView />}
    </div>
  );
}
