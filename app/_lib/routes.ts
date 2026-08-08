// 라우트 상수 — 경로 문자열을 화면 코드에 흩뿌리지 않기 위한 단일 지점.
// 구조는 Figma `화면GUI` 섹션(298:3420)의 플로우 분류를 따른다.
//
//   (tabs) 그룹  = GNB가 유지되는 5개 탭             → app/(tabs)/layout.tsx
//   그룹 바깥    = GNB 없이 화면을 덮는 풀스크린 흐름 → 상세·제보·온보딩
//
// 탭 순서는 Figma nav/gnb(223-7003)의 항목 순서와 같다: 홈 · 시세 · 가게 · 찜 · 내 정보.

export const ROUTES = {
  /** F01 홈 */
  home: "/",
  /** F02 야채 시세 (그리드·검색·정렬) */
  prices: "/prices",
  /** F03 동네 가게 (전체화면 지도) */
  stores: "/stores",
  /** F04 찜 (야채 · 가게 2탭) */
  saved: "/saved",
  /** F05 마이페이지 — Figma 미확정 */
  mypage: "/mypage",

  /** 시세 상세 — GNB 없는 풀스크린. Figma 미확정 */
  priceDetail: (itemId: string) => `/prices/${itemId}`,
  /** 제보 흐름 — Figma 미확정 */
  report: "/report",
  /** 온보딩·로그인 — Figma 미확정 */
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
