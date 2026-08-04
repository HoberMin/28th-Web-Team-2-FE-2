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

/** "2026-07-30" → "7월 30일 기준" — 시세 화면(야채 시세 탭·홈 미리보기) 공통 기준일 표기. */
export function formatAsOfLabel(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}월 ${Number(d)}일 기준`;
}

// ─────────────────────────────────────────────────────────────────────────
// 시세 대비 표기 통일 (백로그 「공통·용어」) — **아직 어디서도 쓰지 않는다.**
// 화면마다 부호(+/−, ↓, ▼, 괄호)·소수 자릿수(1자리 vs 정수)·단어가 제각각이라 하나로 모은다.
// 적용(기존 화면 교체)은 다음 파도 작업. 여기 만든 이름·시그니처가 그 작업의 계약이다.
// ─────────────────────────────────────────────────────────────────────────

/**
 * 기준선 이름 단일 표기 — "시세"/"오늘 시세"/"오늘 공공 시세"/"공공 시세(KAMIS)" 4종이 섞여 있던 걸
 * 하나로 모은다. 판정 로직(`judgement.ts`)의 기준이 공공 시세 단일로 통일된 것(2026-07-31)과도 정합.
 */
export const BASELINE_LABEL = "오늘 공공 시세";

/**
 * 시세 대비 차이 문구 — **부호 규약: 양수 = 비쌈**(`stores.ts`의 `diffPct`·`judgement.ts`의 `pct`와
 * 통일. 예전엔 이 둘이 서로 반대 부호였다). 소수 1자리로 반올림해 자릿수도 고정한다.
 *
 * @param diffPct 기준가 대비 차이(%). 양수=비쌈, 음수=쌈, 0=같음
 * @param diffWon 기준가 대비 차액(원, 부호 규약 동일). 생략하면 퍼센트만 문장에 담는다
 * @returns 예: "1,200원 싸요 (12%)" · diffWon 생략 시 "시세보다 12% 싸요" · 0%면 "시세와 같아요"
 */
export function formatDiff(diffPct: number, diffWon?: number): string {
  const pct = Math.round(diffPct * 10) / 10;
  if (pct === 0) return "시세와 같아요";
  const word = pct > 0 ? "비싸요" : "싸요";
  const pctText = `${Math.abs(pct)}%`;
  if (diffWon === undefined) return `시세보다 ${pctText} ${word}`;
  return `${formatWon(Math.abs(diffWon))} ${word} (${pctText})`;
}

/** `formatDiff`·화면 표기와 짝을 맞추는 색 토큰. */
export type DiffColorToken = "text-green-600" | "text-red-600" | "text-content-secondary";

/**
 * 시세 대비 상태 → 색 토큰. **초록=싸다 전용 / 빨강=비싸다 전용 / 회색=같음** — 교차검증·오늘 제보
 * 같은 "신뢰" 신호와 색을 공유하지 않는다(백로그 「공통」#2 — 지금 초록이 싸다·오늘 제보·교차검증
 * 3가지 뜻으로 쓰여 가게 상세 한 줄에서 서로 다른 두 의미가 같은 색으로 나란히 뜬다).
 * 가게·가게 상세가 지금 "비쌈"을 회색으로 쓰는 것도 이 함수 적용 시 빨강으로 통일된다(다음 파도).
 */
export function getDiffColorToken(diffPct: number): DiffColorToken {
  if (diffPct < 0) return "text-green-600";
  if (diffPct > 0) return "text-red-600";
  return "text-content-secondary";
}
