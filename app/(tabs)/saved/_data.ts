// F04 찜 화면의 **더미 데이터**. 찜 여부는 공용 localStorage 저장소가 맡고, 이 파일은 찜 목록에
// 표시할 품목별 시세와 가게 영업시간·거리 데이터만 준비한다.
//
// 야채는 시세 탭과 같은 46종 파생 데이터를 재사용하고, 가게는 상세 라우트가 사용하는
// `app/(tabs)/stores/_data.ts`에서 읽는다. 목록 ID와 상세 페이지 ID를 동일하게 유지한다.

import { buildPriceRows, type PriceRow } from "../prices/_list";
import { MAP_STORES } from "../stores/_data";
import type { SavedStoreOpenState } from "./_components/row-saved-store";

/** URL 쿼리 `?tab=` 값. 기본은 야채 탭(Figma의 첫 화면 F04_찜_야채). */
export type SavedTab = "vegetable" | "store";

export const DEFAULT_SAVED_TAB: SavedTab = "vegetable";

export function parseSavedTab(value: string | undefined): SavedTab {
  return value === "store" ? "store" : DEFAULT_SAVED_TAB;
}

export type SavedVegetable = Pick<
  PriceRow,
  "id" | "name" | "image" | "price" | "unit" | "trendState" | "trendAmount" | "trendPercent"
>;

// 시세 탭에서 어떤 품목을 찜해도 F04에 나타날 수 있도록 전체 카탈로그를 후보로 준비한다.
// 실제 노출 여부와 순서는 Client Component가 `useFavorites()` 값으로 결정한다.
export const SAVED_VEGETABLES: SavedVegetable[] = buildPriceRows().rows.map(
  ({ id, name, image, price, unit, trendState, trendAmount, trendPercent }) => ({
    id,
    name,
    image,
    price,
    unit,
    trendState,
    trendAmount,
    trendPercent,
  }),
);

export interface SavedStore {
  id: string;
  name: string;
  /** 예: "0.2km" */
  distance: string;
  openState: SavedStoreOpenState;
  openLabel: string;
  /** 예: "수 10:00 - 22:00" */
  hours: string;
}

export const SAVED_STORES: SavedStore[] = MAP_STORES.map((store) => ({
  id: store.id,
  name: store.name,
  distance: store.distance,
  openState: store.openState === "영업중" ? "open" : "closed",
  openLabel: store.openState,
  hours: store.openHours,
}));
