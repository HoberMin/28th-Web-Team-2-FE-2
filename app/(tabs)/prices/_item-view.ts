import type { Item } from "@/app/_lib/api/schemas/items";
import { formatAsOfLabel, formatWon } from "@/app/_lib/format";
import { getPriceVegetableImage } from "./_images";

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
  isTemporary: boolean;
}

/**
 * 목록 툴바의 "N월 N일 기준" 표기.
 *
 * UI QA 2026-08-20 #25 — 기준일이 없을 때 "기준일 정보 없음"이 뜨는 게 화면에서 눈에 걸린다는
 * 지적을 받아 **오늘 날짜로 대체**한다. 이 화면은 Server Component에서만 렌더하므로 서버 시각
 * 하나로 결정되고 hydration 불일치가 없다.
 *
 * ⚠️ 트레이드오프: 이건 "조사 기준일"이 아니라 "조회한 날"이다. Spring이 `baseDate`를 주지
 *    않는 경우에만 쓰이므로 사용자에게 보이는 값은 항상 채워지지만, 실제 시세가 며칠 전
 *    조사분이어도 오늘로 보인다. 정확한 기준일이 필요하면 BE가 `baseDate`를 항상 내려줘야 한다.
 *    `now`를 인자로 받는 이유는 테스트에서 시각을 고정하기 위해서다.
 */
export function formatItemBaseDateLabel(baseDate: string | null, now: Date = new Date()): string {
  if (baseDate) return formatAsOfLabel(baseDate);
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return formatAsOfLabel(iso);
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
    image: getPriceVegetableImage(item.itemName),
    price: item.price === null ? "가격 없음" : formatWon(item.price),
    unit: item.defaultUnit ? `/${item.defaultUnit}` : "",
    trendState: hasTrend ? trend : "flat",
    trendAmount: hasTrend && item.priceGap !== null ? formatWon(Math.abs(item.priceGap)) : "",
    trendPercent: hasTrend
      ? `(${trend === "up" ? "+" : "-"}${Math.abs(item.priceDiffRate ?? 0)}%)`
      : "",
    isLiked: item.isLiked,
    isTemporary: item.isTemporary,
  };
}
