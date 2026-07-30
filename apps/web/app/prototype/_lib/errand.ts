// 심부름 목록 인코딩 — 장바구니를 링크 하나로 넘긴다.
//
// 왜 필요한가: 타깃이 "4인 이상 가족의 장보기 담당"인데 앱은 완전히 1인용이었다. 장보기를
// 부탁받은 사람(배우자·자녀)은 시세를 몰라 비싸게 사 온다. 목록과 **적정 가격 상한**만 넘겨주면
// 그 문제가 바로 풀리고, 앱을 안 쓰는 사람도 결과적으로 이 서비스의 기준을 쓰게 된다.
//
// 프로토타입은 서버 저장 없이 URL에 담는다(로그인·공유 인프라 없음).
// 형식: "potato:1,onion:2" — 짧고 사람이 읽을 수 있어 디버깅이 쉽다.

import type { BasketItem } from "./basket-store";
import { getVegetable } from "./vegetables";

/** 장바구니 → URL 파라미터 문자열. */
export function encodeErrandList(items: BasketItem[]): string {
  return items
    .filter((i) => i.weightKg > 0)
    .map((i) => `${i.vegetableId}:${i.weightKg}`)
    .join(",");
}

/** URL 파라미터 → 장바구니. 모르는 품목·잘못된 수량은 조용히 버린다(링크가 깨져도 화면은 뜬다). */
export function decodeErrandList(raw: string): BasketItem[] {
  if (!raw) return [];
  const items: BasketItem[] = [];
  for (const chunk of raw.split(",")) {
    const [id, qty] = chunk.split(":");
    if (!id || !getVegetable(id)) continue;
    const weightKg = Number(qty);
    if (!Number.isFinite(weightKg) || weightKg <= 0) continue;
    items.push({ vegetableId: id, weightKg });
  }
  return items;
}

/**
 * 적정 가격 상한 — 심부름하는 사람에게 "이 가격까지는 사도 된다"를 준다.
 * 판정 밴드와 같은 기준(+8%)을 쓴다. 기준가가 없으면 상한도 없다(모르는 걸 아는 척하지 않는다).
 */
export function getPriceCeiling(baselinePrice: number | null, lowestReport: number | null): number | null {
  const reference = lowestReport ?? baselinePrice;
  if (reference == null || reference <= 0) return null;
  return Math.round((reference * 1.08) / 10) * 10;
}
