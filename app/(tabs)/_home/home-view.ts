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

/**
 * 등락 금액(원)은 응답에 없다 — `lowest-prices`가 주는 건 `price`(현재가)와
 * `priceDiffRate`(공공 시세 대비 퍼센트 수치)뿐이다. 대신 이 둘로 **역산**한다: 퍼센트 수치를
 * 비율로 바꾼 `decimalRate = rate / 100`의 정의가 `decimalRate = (price - publicPrice) / publicPrice`이므로
 * `publicPrice = price / (1 + decimalRate)`이고,
 * 차액은 `price - publicPrice`다. 지어낸 값이 아니라 이미 받은 두 수치의 수학적 재구성이다
 * (Figma `list/lowest-vegetable`도 금액+비율을 같이 보여준다 — 253:1437 실측, 사용자 신고로 발견).
 * `rate`가 -100%(공공가 0원)에 가까우면 나눗셈이 불안정해지므로 그 구간은 비운다.
 */
function computeTrendAmountWon(price: number, rate: number | null | undefined): string {
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate === 0) return "";
  const decimalRate = rate / 100;
  const divisor = 1 + decimalRate;
  if (Math.abs(divisor) < 0.01) return "";
  const publicPrice = price / divisor;
  return formatWon(Math.round(Math.abs(price - publicPrice)));
}

export function mapRegionLowestPriceToView(item: RegionLowestPriceItem): HomeLowestVegetable {
  const rate = item.priceDiffRate;

  return {
    id: String(item.reportId),
    itemId: String(item.itemId),
    name: item.itemName,
    storeName: item.storeName ?? "가게 정보 없음",
    price: formatWon(item.price),
    // 스펙의 `unit`은 "1kg"처럼 슬래시가 없다. 화면 표기가 "/1kg"라 여기서 붙인다.
    unit: item.unit ? `/${item.unit}` : "",
    trend: trendDirection(rate),
    trendAmount: computeTrendAmountWon(item.price, rate),
    trendRate: typeof rate === "number" && Number.isFinite(rate) ? Math.abs(rate) : 0,
  };
}

export function mapRecommendedStoreToView(store: RecommendedStore): HomeRecommendedStore {
  const shown = store.cheapItems.slice(0, MAX_CARD_VEGETABLES);

  return {
    storeId: String(store.storeId),
    name: store.storeName,
    distance: formatDistance(store.distanceMeters),
    summaryLabel: "공공 시세보다 저렴한 야채",
    summaryValue: `${store.cheapItemCount}가지`,
    vegetables: shown,
  };
}
