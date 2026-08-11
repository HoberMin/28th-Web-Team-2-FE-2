"use client";

import { useFavorites } from "../../../_lib/favorites-store";
import { ROUTES } from "../../../_lib/routes";
import { PriceVegetableCard } from "../../prices/_price-vegetable-card";
import type { SavedVegetable } from "../_data";
import { SavedEmpty } from "./saved-empty";

export interface SavedVegetableListProps {
  vegetables: SavedVegetable[];
}

/** 공용 찜 저장소와 동기화되는 F04 야채 목록. 하트를 해제한 카드는 즉시 목록에서 빠진다. */
export function SavedVegetableList({ vegetables }: SavedVegetableListProps) {
  const favoriteIds = useFavorites();
  const vegetableById = new Map(vegetables.map((vegetable) => [vegetable.id, vegetable]));
  const favorites = favoriteIds.flatMap((id) => {
    const vegetable = vegetableById.get(id);
    return vegetable ? [vegetable] : [];
  });

  if (favorites.length === 0) {
    return (
      <SavedEmpty
        title="찜한 야채가 없어요"
        description="시세 화면에서 하트를 누르면 여기에 모여요."
        actionHref={ROUTES.prices}
        actionLabel="야채 시세 보러 가기"
      />
    );
  }

  return (
    <ul className="grid grid-cols-3 gap-x-3 gap-y-10">
      {favorites.map((vegetable) => (
        <li key={vegetable.id}>
          <PriceVegetableCard
            id={vegetable.id}
            name={vegetable.name}
            image={vegetable.image}
            price={vegetable.price}
            unit={vegetable.unit}
            trendState={vegetable.trendState}
            trendAmount={vegetable.trendAmount}
            trendPercent={vegetable.trendPercent}
          />
        </li>
      ))}
    </ul>
  );
}
