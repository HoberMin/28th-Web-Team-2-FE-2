"use client";

import { useMyReports } from "../_lib/reports-store";
import { summarizeSpending } from "../_lib/spending";
import { getVegetable } from "../_lib/vegetables";
import { formatNumber } from "../_lib/format";

// 주간 리포트 — "이번 주에 얼마 아꼈나"를 한 문장으로.
//
// 왜 필요한가: 소비 요약(누적)은 첫 달이 지나면 숫자가 커져서 변화가 안 느껴진다. 장보기는
// 주 단위 리듬이라 **주간**이 사용자가 체감하는 단위이고, 재방문 이유도 여기서 나온다.
// (핵심 가치 ②: 눈으로 보는 변화)
export function WeeklyReport({ todayIso }: { todayIso: string }) {
  const myReports = useMyReports();
  const weekAgo = Date.parse(todayIso) - 7 * 86_400_000;

  const thisWeek = myReports.filter(
    (r) => r.purchased && Date.parse(r.createdAt.slice(0, 10)) >= weekAgo,
  );
  if (thisWeek.length === 0) return null;

  const summary = summarizeSpending(thisWeek);
  // 가장 잘 산 품목 — 절약액이 가장 큰 건. 칭찬할 대상이 구체적이어야 다음 행동으로 이어진다.
  const best = thisWeek.reduce((acc, r) => {
    const accSaved = summarizeSpending([acc]).saved;
    const rSaved = summarizeSpending([r]).saved;
    return rSaved > accSaved ? r : acc;
  }, thisWeek[0]);
  const bestSaved = summarizeSpending([best]).saved;
  const bestName = getVegetable(best.vegetableId)?.name;

  const positive = summary.saved >= 0;

  return (
    <section
      aria-label="이번 주 리포트"
      className="flex flex-col gap-2 rounded-2xl bg-bg-neutral-weak px-5 py-4"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-body-16-semibold text-fg-neutral">이번 주 장보기</h2>
        <span className="text-caption-12-regular tabular-nums text-fg-neutral-subtle">
          최근 7일 · {summary.count}건
        </span>
      </div>
      <p className="text-body-14-regular text-fg-neutral">
        시세보다{" "}
        <strong className={`font-semibold tabular-nums ${positive ? "text-fg-positive" : "text-fg-warning"}`}>
          {formatNumber(Math.abs(summary.saved))}원
        </strong>{" "}
        {positive ? "아꼈어요" : "더 썼어요"}
      </p>
      {bestName && bestSaved > 0 && (
        <p className="text-caption-12-regular tabular-nums text-fg-neutral-subtle">
          가장 잘 산 건 {bestName} — 시세보다 {formatNumber(bestSaved)}원 저렴하게 사셨어요
          {best.place ? ` (${best.place})` : ""}
        </p>
      )}
    </section>
  );
}
