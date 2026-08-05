/**
 * 클래스 문자열을 합치는 최소 유틸. falsy는 버린다.
 *
 * tailwind-merge 같은 충돌 해소는 하지 않는다 — 각 컴포넌트가 variant별 클래스를
 * 서로 겹치지 않게 관리하고, 호출자 `className`은 레이아웃(너비·마진) 용도로만 쓴다.
 * 같은 속성을 덮어써야 하면 클래스 순서가 아니라 컴포넌트 prop(variant·state)으로 푼다
 * — Tailwind는 클래스 나열 순서가 아니라 생성된 CSS 순서로 이기기 때문에
 * "뒤에 쓴 클래스가 이긴다"를 신뢰할 수 없다.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
