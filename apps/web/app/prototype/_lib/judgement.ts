// 즉석 판단(신호등) 로직 — "지금 이 가격, 사도 되나?"에 한 장으로 답한다.
// 매장 가격표 앞에서 3초 안에 끝나야 하는 판단이라, 화면이 아니라 이 함수가 결론을 낸다.
//
// 판단 기준은 두 개를 함께 본다:
//   1) 오늘 공공 시세(KAMIS) — 전국·광역 기준선
//   2) 우리 동네 이웃 제보가 중 최저 — 실제로 그 동네에서 가능한 가격
// 동네 최저가가 있으면 그쪽을 우선 기준으로 삼는다(같은 동네에서 더 싸게 산 사람이 있다는 게 더 강한 근거).

import type { PriceVerdict, Report } from "./types";

/** 기준가 대비 몇 % 안쪽이면 "적정"으로 볼지. 밖이면 싸다/비싸다로 판정. */
const FAIR_BAND_PCT = 8;

export interface JudgementInput {
  /** 사용자가 입력한 가격(원) — 기준 단위로 환산된 값 */
  pricePerUnit: number;
  /** 오늘 공공 시세(원, 기준 단위) */
  baselinePrice: number;
  /** 우리 동네 제보가 목록(같은 품목) */
  neighborReports: Report[];
}

export interface Judgement {
  verdict: PriceVerdict;
  /** 판정에 쓴 기준가(원) */
  referencePrice: number;
  /** 기준가의 출처 — 사용자에게 근거를 밝힌다 */
  referenceLabel: string;
  /** 기준가 대비 차액(원). 양수 = 기준보다 쌈 */
  diff: number;
  /** 기준가 대비 차이(%). 양수 = 기준보다 쌈 */
  pct: number;
  /** 한 줄 결론 — 그대로 화면에 쓴다 */
  headline: string;
  /** 다음 행동 제안 */
  advice: string;
}

/** 동네 제보가 중 최저 1kg 환산가. 제보 없으면 null. */
export function getNeighborhoodLowest(reports: Report[]): number | null {
  if (reports.length === 0) return null;
  return Math.min(...reports.map((r) => r.pricePerKg));
}

/**
 * 입력 가격을 기준가와 비교해 신호등 판정을 낸다.
 * 기준가가 0 이하(데이터 없음)면 판정 불가 → null.
 */
export function judgePrice(input: JudgementInput): Judgement | null {
  const { pricePerUnit, baselinePrice, neighborReports } = input;
  if (pricePerUnit <= 0) return null;

  const lowest = getNeighborhoodLowest(neighborReports);
  // 동네 최저가가 있으면 그것을 기준으로 — "같은 동네에서 이 가격에 산 사람이 있다"가 더 강한 근거다.
  const referencePrice = lowest ?? baselinePrice;
  const referenceLabel = lowest !== null ? "우리 동네 최저 제보가" : "오늘 공공 시세";
  if (referencePrice <= 0) return null;

  const diff = referencePrice - pricePerUnit;
  const pct = Math.round((diff / referencePrice) * 1000) / 10;

  if (pct >= FAIR_BAND_PCT) {
    return {
      verdict: "cheap",
      referencePrice,
      referenceLabel,
      diff,
      pct,
      headline: "지금 사도 좋아요",
      advice: `${referenceLabel}보다 ${Math.abs(pct)}% 싸요. 필요하면 넉넉히 사도 괜찮은 가격이에요.`,
    };
  }
  if (pct <= -FAIR_BAND_PCT) {
    return {
      verdict: "expensive",
      referencePrice,
      referenceLabel,
      diff,
      pct,
      headline: "조금 비싸요",
      advice: `${referenceLabel}보다 ${Math.abs(pct)}% 비싸요. 급하지 않으면 다른 가게도 한 번 보세요.`,
    };
  }
  return {
    verdict: "fair",
    referencePrice,
    referenceLabel,
    diff,
    pct,
    headline: "적당한 가격이에요",
    advice: `${referenceLabel}과 비슷해요. 이 가격이면 무리 없이 사도 돼요.`,
  };
}
