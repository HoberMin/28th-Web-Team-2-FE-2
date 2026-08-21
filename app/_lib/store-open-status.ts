// Spring이 주는 `openStatus` 원시 문자열 → 화면 문구.
//
// 스펙(`/v3/api-docs`)에 enum이 없어서 어떤 값이 오는지 문서로는 확정할 수 없다. 백엔드 소스
// (`GetStoreDetailUseCase`·`StoreDetailSnapshot`)를 읽어 확인한 값은 `OPEN`·`CLOSED`·`UNKNOWN`
// 세 개고, 카카오 페이지에서 다른 값이 올라올 여지가 있어 **화이트리스트로만** 판정한다.
// 모르는 값은 **원시 문자열을 화면에 흘리지 않고** "영업정보 없음"으로 떨어뜨린다 — 이 함수가
// 생긴 계기가 애초에 `"UNKNOWN"`이 그대로 노출된 것이라, 같은 부류의 사고를 값 하나 늘 때마다
// 다시 내지 않으려는 것이다. 대신 로그를 남겨 화이트리스트를 늘릴 신호로 쓴다.
//
// 찜「가게」탭과 가게 상세가 같은 값을 받아 서로 다른 문구를 그리던 걸 여기로 모았다
// (2026-08-21 — 상세는 `"UNKNOWN"`을 그대로 노출하고 있었다).

import type { SavedStoreOpenState } from "@/app/(tabs)/saved/_components/row-saved-store";

/** 화면이 색으로 나르는 두 상태. 찜 「가게」 탭 행 컴포넌트의 타입을 그대로 쓴다. */
export type StoreOpenState = SavedStoreOpenState;

const OPEN_STATUS_LABELS: Record<string, { state: StoreOpenState; label: string }> = {
  OPEN: { state: "open", label: "영업중" },
  OPENING: { state: "open", label: "영업중" },
  CLOSED: { state: "closed", label: "영업종료" },
  CLOSING_SOON: { state: "open", label: "곧 영업종료" },
  UNKNOWN: { state: "closed", label: "영업정보 없음" },
};

/**
 * `openStatus`를 화면 문구로 바꾼다. 값이 없으면 `undefined` — 부르는 쪽이 줄을 비울지
 * 기본 문구를 쓸지 정한다(상세는 직전 화면이 넘긴 값으로 폴백하고, 찜 탭은 기본 문구를 쓴다).
 */
export function resolveStoreOpenStatus(
  status: string | null | undefined,
): { state: StoreOpenState; label: string } | undefined {
  const trimmed = status?.trim();
  if (!trimmed) return undefined;
  const known = OPEN_STATUS_LABELS[trimmed.toUpperCase()];
  if (known) return known;
  console.warn("모르는 openStatus 값", { openStatus: trimmed });
  return { state: "closed", label: "영업정보 없음" };
}
