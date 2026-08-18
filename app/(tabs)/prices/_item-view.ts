import type { Item } from "@/app/_lib/api/schemas/items";
import { formatWon } from "@/app/_lib/format";

const FALLBACK_ITEM_IMAGE = "/figma/design-library/images/vegetable-grid.png";

export type TrendState = "up" | "down" | "flat";

export interface PriceItemView {
  itemId: number;
  name: string;
  image: string;
  price: string;
  unit: string;
  trendState: TrendState;
  trendAmount: string;
  trendPercent: string;
  isLiked: boolean;
}

function safeItemImage(image: string | null | undefined): string {
  if (!image) return FALLBACK_ITEM_IMAGE;

  try {
    const url = new URL(image);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : FALLBACK_ITEM_IMAGE;
  } catch {
    return FALLBACK_ITEM_IMAGE;
  }
}

function trendState(priceGap: number | null): TrendState {
  if (priceGap === null || priceGap === 0) return "flat";
  return priceGap > 0 ? "up" : "down";
}

export function mapItemToPriceView(item: Item): PriceItemView {
  const trend = trendState(item.priceGap);
  const hasTrend = trend !== "flat" && item.priceDiffRate !== null;

  return {
    itemId: item.itemId,
    name: item.itemName,
    image: safeItemImage(item.itemImageUrl),
    price: item.price === null ? "가격 없음" : formatWon(item.price),
    unit: item.defaultUnit ? `/${item.defaultUnit}` : "",
    trendState: hasTrend ? trend : "flat",
    trendAmount: hasTrend && item.priceGap !== null ? formatWon(Math.abs(item.priceGap)) : "",
    trendPercent: hasTrend
      ? `(${trend === "up" ? "+" : "-"}${Math.abs(item.priceDiffRate ?? 0)}%)`
      : "",
    isLiked: item.isLiked,
  };
}
