// F04 찜 화면의 가게 탭용 더미 데이터. 야채 탭은 Spring items API를 사용한다.

import { MAP_STORES } from "../stores/_data";
import type { SavedStoreOpenState } from "./_components/row-saved-store";

/** URL 쿼리 `?tab=` 값. 기본은 야채 탭(Figma의 첫 화면 F04_찜_야채). */
export type SavedTab = "vegetable" | "store";

export const DEFAULT_SAVED_TAB: SavedTab = "vegetable";

export function parseSavedTab(value: string | undefined): SavedTab {
  return value === "store" ? "store" : DEFAULT_SAVED_TAB;
}

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
