// F04 찜 화면의 탭 파싱. 두 탭 모두 Spring API를 쓴다 —
// 야채는 `GET /items?favoriteOnly=true`, 가게는 `GET /users/me/favorite-stores`.

/** URL 쿼리 `?tab=` 값. 기본은 야채 탭(Figma의 첫 화면 F04_찜_야채). */
export type SavedTab = "vegetable" | "store";

export const DEFAULT_SAVED_TAB: SavedTab = "vegetable";

export function parseSavedTab(value: string | undefined): SavedTab {
  return value === "store" ? "store" : DEFAULT_SAVED_TAB;
}
