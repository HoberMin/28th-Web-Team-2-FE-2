// 즉석 판단(신호등) 로직 — "지금 이 가격, 사도 되나?"에 한 장으로 답한다.
// 가게 가격표 앞에서 3초 안에 끝나야 하는 판단이라, 화면이 아니라 이 함수가 결론을 낸다.
//
// 판단 기준은 **오늘 공공 시세(KAMIS) 단일**이다(백로그 「공통」#1, 2026-07-31 설계 변경).
// 예전엔 "동네 최저 제보가 있으면 그쪽 우선"이었는데, 가게 상세·가게(stores.ts)는 항상 공공 시세
// 대비로 계산해서 **같은 가격이 화면마다 싸다/비싸다로 반대로 나오는 버그**가 있었다. 동네 제보가는
// 여전히 화면에 보여주되(근거 참고용) 판정 자체에는 쓰지 않는다.

import type { PriceVerdict } from "./types";
import { BASELINE_LABEL, formatDiff } from "./format";

/** 기준가 대비 몇 % 안쪽이면 "적정"으로 볼지. 밖이면 싸다/비싸다로 판정. */
const FAIR_BAND_PCT = 8;

/**
 * 기준가 대비 이만큼(%) 벌어지면 "자릿수 오타" 의심 — 백로그 F10 #6.
 * 3,000원 자리에 300,000원을 넣으면 9900%가 나오는데 제목이 "조금 비싸요"인 건 사용자를 속인다.
 */
const EXTREME_PCT = 100;

export interface JudgementInput {
  /** 사용자가 입력한 가격(원) — 기준 단위로 환산된 값 */
  pricePerUnit: number;
  /** 오늘 공공 시세(원, 기준 단위) — 유일한 판정 기준 */
  baselinePrice: number;
}

export interface Judgement {
  verdict: PriceVerdict;
  /** 판정에 쓴 기준가(원) — 항상 오늘 공공 시세 */
  referencePrice: number;
  /** 기준가의 출처 — 사용자에게 근거를 밝힌다(항상 "오늘 공공 시세") */
  referenceLabel: string;
  /**
   * 기준가 대비 차액(원). **양수 = 기준보다 비쌈**(stores.ts의 diffPct 부호 규약과 통일 —
   * 예전엔 반대(양수=쌈)라 화면마다 부호 해석이 갈렸다).
   */
  diff: number;
  /** 기준가 대비 차이(%). 양수 = 기준보다 비쌈 */
  pct: number;
  /** 한 줄 결론 — 그대로 화면에 쓴다 */
  headline: string;
  /** 다음 행동 제안 */
  advice: string;
  /** 기준가 대비 100% 이상 벌어졌는지 — 자릿수 오타 의심 신호(화면에서 확인 안내로 씀) */
  isExtreme: boolean;
}

/**
 * 입력 가격을 오늘 공공 시세와 비교해 신호등 판정을 낸다.
 * 기준가가 0 이하(데이터 없음)면 판정 불가 → null.
 */
export function judgePrice(input: JudgementInput): Judgement | null {
  const { pricePerUnit, baselinePrice } = input;
  if (pricePerUnit <= 0 || baselinePrice <= 0) return null;

  const referencePrice = baselinePrice;
  const referenceLabel = BASELINE_LABEL;

  const diff = pricePerUnit - referencePrice;
  const pct = Math.round((diff / referencePrice) * 1000) / 10;
  const diffText = formatDiff(pct, diff);

  if (pct <= -FAIR_BAND_PCT) {
    const isExtreme = Math.abs(pct) >= EXTREME_PCT;
    return {
      verdict: "cheap",
      referencePrice,
      referenceLabel,
      diff,
      pct,
      isExtreme,
      headline: isExtreme ? "가격을 다시 확인해주세요" : "지금 사도 좋아요",
      advice: isExtreme
        ? `${diffText}. 혹시 자릿수를 잘못 입력했는지 확인해보세요.`
        : `${diffText}. 필요하면 넉넉히 사도 괜찮은 가격이에요.`,
    };
  }
  if (pct >= FAIR_BAND_PCT) {
    const isExtreme = pct >= EXTREME_PCT;
    return {
      verdict: "expensive",
      referencePrice,
      referenceLabel,
      diff,
      pct,
      isExtreme,
      headline: isExtreme ? "가격을 다시 확인해주세요" : "조금 비싸요",
      advice: isExtreme
        ? `${diffText}. 혹시 0을 하나 더 입력하지 않았는지 확인해보세요.`
        : `${diffText}. 급하지 않으면 다른 가게도 한 번 보세요.`,
    };
  }
  return {
    verdict: "fair",
    referencePrice,
    referenceLabel,
    diff,
    pct,
    isExtreme: false,
    headline: "적당한 가격이에요",
    advice: `${referenceLabel}과 비슷해요. 이 가격이면 무리 없이 사도 돼요.`,
  };
}
