import { getCheapestMonth } from "../_lib/cheapest-month";
import type { PricePoint } from "../_lib/types";

// 월별 최저가 시기 — 최근 1년 12개월 평균에서 계산(식물학적 제철이 아니라 실제 시세 기준). 서버 렌더.
export function CheapestMonthBadge({ yearSeries }: { yearSeries: PricePoint[] }) {
  const cheapest = getCheapestMonth(yearSeries);
  if (!cheapest || cheapest.cheaperThanLatestPct <= 0) return null;

  return (
    <p className="rounded-xl bg-bg-brand-weak px-4 py-3 text-body-14-regular text-fg-neutral">
      <span className="font-semibold text-fg-neutral">{cheapest.month}월</span>이 최근 1년 중 가장 쌌어요 (지금보다
      약 {cheapest.cheaperThanLatestPct}% 저렴)
    </p>
  );
}
