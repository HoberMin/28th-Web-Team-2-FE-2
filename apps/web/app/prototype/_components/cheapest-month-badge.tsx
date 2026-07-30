import { getCheapestMonth } from "../_lib/cheapest-month";
import type { BaselinePrice, PricePoint } from "../_lib/types";

// 월별 최저가 시기 — KAMIS 실시세 12개월 평균에서 계산(식물학적 제철 아님). 인터랙션 없어 서버 렌더.
// KAMIS 폴백(dummy) 시계열은 합성값이라 "예시" 라벨을 붙여 실데이터와 구분한다(빈 화면 대신 항상 노출).
export function CheapestMonthBadge({
  yearSeries,
  source,
}: {
  yearSeries: PricePoint[];
  source: BaselinePrice["source"];
}) {
  const cheapest = getCheapestMonth(yearSeries);
  if (!cheapest || cheapest.cheaperThanLatestPct <= 0) return null;

  return (
    <p className="rounded-xl bg-bg-brand-weak px-4 py-3 text-body-14-regular text-fg-neutral">
      {source !== "kamis" && (
        <span className="mr-1 text-caption-12-regular text-fg-neutral-muted">예시 ·</span>
      )}
      <span className="font-semibold text-fg-neutral">{cheapest.month}월</span>이 최근 1년 중 가장 쌌어요 (지금보다
      약 {cheapest.cheaperThanLatestPct}% 저렴)
    </p>
  );
}
