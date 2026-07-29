import { getCheapestMonth } from "../_lib/cheapest-month";
import type { BaselinePrice, PricePoint } from "../_lib/types";

// 월별 최저가 시기 — KAMIS 실시세 12개월 평균에서 계산(식물학적 제철 아님). 인터랙션 없어 서버 렌더.
// KAMIS 폴백(dummy) 시계열은 합성값이라 "가장 쌌어요"가 거짓 인사이트가 됨 → 실데이터일 때만 노출.
export function CheapestMonthBadge({
  yearSeries,
  source,
}: {
  yearSeries: PricePoint[];
  source: BaselinePrice["source"];
}) {
  const cheapest = getCheapestMonth(yearSeries);
  if (source !== "kamis" || !cheapest || cheapest.cheaperThanLatestPct <= 0) return null;

  return (
    <p className="rounded-xl bg-bg-brand-weak px-4 py-3 text-body-14-regular text-fg-neutral">
      <span className="font-semibold text-fg-brand">{cheapest.month}월</span>이 최근 1년 중 가장 쌌어요 (지금보다
      약 {cheapest.cheaperThanLatestPct}% 저렴)
    </p>
  );
}
