"use client";

import Image from "next/image";
import Link from "next/link";
import { GridVegetableItem } from "../../_components/grid-vegetable-item";
import { FigmaIcon } from "../../_lib/figma-asset";
import { toggleFavorite, useIsFavorite } from "../../_lib/favorites-store";
import { ROUTES } from "../../_lib/routes";
import type { TrendState } from "./_list";

const TREND_ICON_NAME: Record<TrendState, string> = {
  down: "trend-down",
  up: "trend-up",
  flat: "trend-flat",
};

const TREND_LABEL: Record<TrendState, string> = {
  down: "어제보다 내림",
  up: "어제보다 오름",
  flat: "어제와 같음",
};

export interface PriceVegetableCardProps {
  id: string;
  name: string;
  image: string;
  price: string;
  unit: string;
  trendState: TrendState;
  trendAmount: string;
  trendPercent: string;
}

export function PriceVegetableCard({
  id,
  name,
  image,
  price,
  unit,
  trendState,
  trendAmount,
  trendPercent,
}: PriceVegetableCardProps) {
  const favorite = useIsFavorite(id);

  return (
    <div className="relative">
      <Link
        href={ROUTES.priceDetail(id)}
        aria-label={`${name} 시세 상세 보기`}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
      />
      <GridVegetableItem
        visual={
          <Image
            src={image}
            alt=""
            width={110}
            height={110}
            className="size-full object-contain"
          />
        }
        name={name}
        price={price}
        unit={unit}
        trendAmount={trendAmount}
        trendPercent={trendPercent}
        trendState={trendState}
        trendIcon={
          <>
            <FigmaIcon name={TREND_ICON_NAME[trendState]} width={16} />
            <span className="sr-only">{TREND_LABEL[trendState]}</span>
          </>
        }
        favorite={favorite}
        favoriteIcon={
          <button
            type="button"
            aria-label={`${name} ${favorite ? "찜 취소" : "찜하기"}`}
            aria-pressed={favorite}
            onClick={() => toggleFavorite(id)}
            className="relative z-20 flex size-9 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
          >
            <FigmaIcon
              name={favorite ? "heart-fill-grid-24" : "heart-stroke-grid-24"}
              width={24}
            />
          </button>
        }
      />
    </div>
  );
}
