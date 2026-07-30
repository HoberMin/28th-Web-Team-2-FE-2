// 표시 포맷터 — 순수 함수 (서버·클라 공용).

import type { VegetableUnit } from "./types";

/**
 * 수량 표기 — 46종의 기준 단위가 kg·개·포기·g로 갈리기 때문에 "kg" 고정 표기는 틀린다
 * (오이 3개를 "3kg"으로 보여주는 버그가 여기서 나왔다).
 * 저장값(quantity)은 **기준 단위의 배수**다: g 품목은 기준이 100g이라 2 → "200g".
 */
export function formatQuantity(quantity: number, unitType: VegetableUnit): string {
  switch (unitType) {
    case "kg":
      return `${quantity}kg`;
    case "개":
      return `${quantity}개`;
    case "포기":
      return `${quantity}포기`;
    case "g":
      return `${quantity * 100}g`;
  }
}

/** 2490 → "2,490원" */
export function formatWon(value: number): string {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

/** 2490 → "2,490" (단위 없이) */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("ko-KR");
}

/** "2026-07-24" → "26.07.24" */
export function formatDateDot(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y.slice(2)}.${m}.${d}`;
}

/** "2026-07-24" → "7/24" (그래프 축 — 일주일·1개월) */
export function formatShortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/** "2026-07-24" → "7월" (그래프 축 — 1년, 월별 시리즈) */
export function formatMonthLabel(iso: string): string {
  const [, m] = iso.split("-");
  return `${Number(m)}월`;
}
