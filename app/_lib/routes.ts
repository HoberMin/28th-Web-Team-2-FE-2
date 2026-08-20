// 라우트 상수 — 경로 문자열을 화면 코드에 흩뿌리지 않기 위한 단일 지점.
// 구조는 Figma `화면GUI` 섹션(298:3420)의 플로우 분류를 따른다.
//
//   (tabs) 그룹  = GNB가 유지되는 5개 탭             → app/(tabs)/layout.tsx
//   그룹 바깥    = GNB 없이 화면을 덮는 풀스크린 흐름 → 상세·제보·온보딩
//
// 탭 순서는 Figma nav/gnb(223-7003)의 항목 순서와 같다: 홈 · 야채 시세 · 가게 · 찜 · 내 정보.

export const ROUTES = {
  /** F01 홈 */
  home: "/",
  /** F02 야채 시세 (그리드·검색·정렬) */
  prices: "/prices",
  /** F03 동네 가게 (전체화면 지도) */
  stores: "/stores",
  /** F03 가게 상세 — GNB 없는 풀스크린 */
  storeDetail: (storeId: string) => `/stores/${storeId}`,
  /** F04 찜 (야채 · 가게 2탭) */
  saved: "/saved",
  /** F05 마이페이지 — Figma 미확정 */
  mypage: "/mypage",
  /** F05 마이페이지 하위 — 내 동네 관리. Figma 시안 없음(기존 컴포넌트 재사용, GNB 없는 풀스크린). */
  mypageRegions: "/mypage/regions",

  /** F03 시세 상세 — GNB 없는 풀스크린 */
  priceDetail: (itemId: string) => `/prices/${itemId}`,
  // ── 제보 흐름 (F04-1~4) — Figma 화면GUI(원본) 364:8063~8317 ─────────────────
  //
  // ⚠️ Figma 화면 코드가 `shared/pages.md`와 어긋나 있었다:
  //      Figma      F04-1 야채 제보 · F04-2 야채 카테고리 · F04-3 판매 장소 선택 · F04-4 제보 완료
  //      pages.md   F04-2 제보 폼 · F04-3 제보 완료 (카테고리·장소는 "폼 안 시트"로만 서술)
  //    → **Figma를 정본으로 정하고 `pages.md`를 갱신했다**(2026-08-13 사용자 확정).
  //    라우트 경로는 F 번호를 박지 않고 서술형으로 둔다 — 화면 코드가 또 바뀌어도 URL이 흔들리지
  //    않게 하려는 것이고, 실제로 이번에 한 번 바뀌었다.

  /** F04-1 야채 제보 폼. `?item=<야채 id>&place=<가게 id>`로 선택값을 물고 다닌다. */
  report: "/report",
  /** F04-2 야채 카테고리·야채 목록·검색. `?group=` 또는 `?q=` */
  reportVegetable: "/report/vegetable",
  /** F04-3 판매 장소 선택 (지도 + 가게 피커) */
  reportPlace: "/report/place",
  /** F04-4 제보 완료 */
  reportDone: "/report/done",
  /** F00 온보딩·로그인 — 소개 → 닉네임 → 지역 선택 */
  onboarding: "/onboarding",
} as const;

/** GNB가 노출되는 탭 경로들. 활성 항목 판정에 쓴다. */
export const TAB_ROUTES = [
  ROUTES.home,
  ROUTES.prices,
  ROUTES.stores,
  ROUTES.saved,
  ROUTES.mypage,
] as const;

export type TabRoute = (typeof TAB_ROUTES)[number];
