import type { PriceItemView } from "../../prices/_item-view";
import { ROUTES } from "../../../_lib/routes";
import { PriceVegetableCard } from "../../prices/_price-vegetable-card";
import { SavedEmpty } from "./saved-empty";

export interface SavedVegetableListProps {
  vegetables: PriceItemView[];
}

/** Spring이 `favoriteOnly=true`로 반환한 로그인 사용자의 찜 야채 목록. */
export function SavedVegetableList({ vegetables }: SavedVegetableListProps) {
  if (vegetables.length === 0) {
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
      {vegetables.map((vegetable) => (
        <li key={vegetable.itemId}>
          <PriceVegetableCard
            itemId={vegetable.itemId}
            name={vegetable.name}
            image={vegetable.image}
            price={vegetable.price}
            unit={vegetable.unit}
            trendState={vegetable.trendState}
            trendAmount={vegetable.trendAmount}
            trendPercent={vegetable.trendPercent}
            initialFavorite={vegetable.isLiked}
            canFavorite
            detailHref={ROUTES.priceDetail(String(vegetable.itemId))}
          />
        </li>
      ))}
    </ul>
  );
}
