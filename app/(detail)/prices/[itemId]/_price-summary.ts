export type PriceTrendDirection = "down" | "up" | "flat";

/** 시세 자체가 없으면 등락도 단정하지 않는다. */
export function getPriceTrendDirection(
  publicPrice: number | null,
  publicPriceDiff: number,
): PriceTrendDirection | null {
  if (publicPrice === null) return null;
  if (publicPriceDiff < 0) return "down";
  if (publicPriceDiff > 0) return "up";
  return "flat";
}
