// Spring DTO → F01 홈 표시 모델.
//
// 화면 컴포넌트는 문자열만 그린다(`_data.ts`의 타입 계약). 숫자·단위 포맷을 여기 모아 두는
// 이유는 추천 가게와 최저가 목록이 서로 다른 엔드포인트에서 오는데 표기는 같아야 해서다.

import type { RecommendedStore } from "@/app/_lib/api/schemas/stores";
import type { RegionLowestPriceItem } from "@/app/_lib/api/schemas/reports";
import { formatDistance } from "@/app/(tabs)/saved/_saved-store-view";
import type { HomeLowestVegetable, HomeRecommendedStore, HomeTrendDirection } from "./_data";

/** Figma 개발 주석: 카드의 야채 목록은 최대 5개, 나머지는 more 뱃지. */
export const MAX_CARD_VEGETABLES = 5;

function formatWon(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}

/**
 * 등락 방향. **API의 `priceDiffRate`는 "공공 시세 대비"**라 시간에 따른 등락이 아니다 —
 * 음수면 공공가보다 싸다는 뜻이다. 화면 문구도 그에 맞춘다(`section-lowest-vegetables`).
 */
function trendDirection(rate: number | null | undefined): HomeTrendDirection {
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate === 0) return "flat";
  return rate < 0 ? "down" : "up";
}

export function mapRegionLowestPriceToView(item: RegionLowestPriceItem): HomeLowestVegetable {
  const rate = item.priceDiffRate;

  return {
    id: String(item.reportId),
    name: item.itemName,
    storeName: item.storeName ?? "가게 정보 없음",
    price: formatWon(item.price),
    // 스펙의 `unit`은 "1kg"처럼 슬래시가 없다. 화면 표기가 "/1kg"라 여기서 붙인다.
    unit: item.unit ? `/${item.unit}` : "",
    trend: trendDirection(rate),
    // **금액 차이는 응답에 없다** — `lowest-prices`가 주는 건 비율뿐이라 금액 자리를 비운다
    // (`formatTrendAmount`가 빈 문자열을 그대로 그린다). 지어내지 않는다.
    trendAmount: "",
    trendRate: typeof rate === "number" && Number.isFinite(rate) ? Math.abs(rate) : 0,
  };
}

export function mapRecommendedStoreToView(store: RecommendedStore): HomeRecommendedStore {
  const shown = store.cheapItems.slice(0, MAX_CARD_VEGETABLES);
  // BE의 `remainingItemCount`는 **BE가 자른 나머지**다. 카드가 5개로 한 번 더 자르면
  // 그만큼을 더해야 뱃지 숫자와 실제 숨은 개수가 맞는다.
  const hiddenHere = Math.max(0, store.cheapItems.length - shown.length);

  return {
    storeId: String(store.storeId),
    name: store.storeName,
    distance: formatDistance(store.distanceMeters),
    summaryLabel: "공공 시세보다 저렴한 야채",
    summaryValue: `${store.cheapItemCount}가지`,
    vegetables: shown,
    moreCount: store.remainingItemCount + hiddenHere,
  };
}
