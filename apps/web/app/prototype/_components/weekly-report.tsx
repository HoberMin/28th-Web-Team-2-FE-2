"use client";

import { useState } from "react";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { useMyReports } from "../_lib/reports-store";
import { summarizeSpending } from "../_lib/spending";
import type { PriceMap } from "../_lib/stores";
import { getVegetable } from "../_lib/vegetables";
import { formatNumber, formatWon } from "../_lib/format";

type Period = "week" | "all";
const PERIODS: { key: Period; label: string }[] = [
  { key: "week", label: "이번 주" },
  { key: "all", label: "전체" },
];

// 절약 카드 — "지금까지 시세 대비"(누적)와 "이번 주 절약"이 같은 지표를 기간만 바꿔 두 번
// 말하던 카드 2장을 세그먼트 토글 하나로 합친다. 누적(전체)은 규모를, 이번 주는 변화를 보여준다는
// 역할은 그대로 유지하되 화면 자리(카드 1장)로 줄인다. (핵심 가치 ②: 눈으로 보는 변화)
//
// 시세 기준(saved 계산)은 서버가 내려준 priceMap(getPriceMap()) — 홈·시세 화면과 같은 "오늘
// 시세"를 쓴다. 예전엔 getBaselineDummy()를 직접 불러 화면마다 기준이 어긋났다(F05 버그 항목).
export function SavingsCard({ todayIso, priceMap }: { todayIso: string; priceMap: PriceMap }) {
  const [period, setPeriod] = useState<Period>("week");
  const myReports = useMyReports();
  const purchases = myReports.filter((r) => r.purchased);

  if (purchases.length === 0) {
    return (
      <section aria-label="내 소비 요약" className="rounded-2xl bg-bg-neutral-weak px-5 py-6">
        <p className="text-body-14-regular text-fg-neutral-muted">
          야채를 사고 가격을 제보하면
          <br />
          시세보다 얼마나 아꼈는지 알려드려요.
        </p>
      </section>
    );
  }

  const weekAgo = Date.parse(todayIso) - 7 * 86_400_000;
  const thisWeek = purchases.filter((r) => Date.parse(r.createdAt.slice(0, 10)) >= weekAgo);
  const scoped = period === "week" ? thisWeek : purchases;
  const summary = summarizeSpending(scoped, priceMap);
  const savedPositive = summary.saved >= 0;

  // 가장 잘 산 품목 — 절약액이 가장 큰 건. 칭찬할 대상이 구체적이어야 다음 행동으로 이어진다.
  const best =
    scoped.length > 0
      ? scoped.reduce((acc, r) => {
          const accSaved = summarizeSpending([acc], priceMap).saved;
          const rSaved = summarizeSpending([r], priceMap).saved;
          return rSaved > accSaved ? r : acc;
        }, scoped[0])
      : undefined;
  const bestSaved = best ? summarizeSpending([best], priceMap).saved : 0;
  const bestName = best ? getVegetable(best.vegetableId)?.name : undefined;

  return (
    <section
      aria-label="내 소비 요약"
      className="flex flex-col gap-3 rounded-2xl bg-bg-brand-weak px-5 py-5"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-body-14-medium text-fg-neutral-muted">
          {period === "week" ? "이번 주 시세 대비" : "지금까지 시세 대비"}
        </p>
        <SegmentedControl aria-label="절약 기간" value={period} onValueChange={(v) => setPeriod(v as Period)}>
          {PERIODS.map((p) => (
            <SegmentedControlItem key={p.key} value={p.key}>
              {p.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>

      {scoped.length === 0 ? (
        <p className="text-body-14-regular text-fg-neutral-muted">최근 7일엔 구매 기록이 없어요.</p>
      ) : (
        <>
          <p className="text-head2-20 text-fg-neutral">
            <span className={savedPositive ? "text-fg-positive" : "text-fg-warning"}>
              {formatNumber(Math.abs(summary.saved))}원
            </span>{" "}
            {savedPositive ? "아꼈어요" : "더 썼어요"}
          </p>
          {bestName && bestSaved > 0 && (
            <p className="text-caption-12-regular tabular-nums text-fg-neutral-muted">
              가장 잘 산 건 {bestName} — 시세보다 {formatNumber(bestSaved)}원 저렴하게 사셨어요
              {best?.place ? ` (${best.place})` : ""}
            </p>
          )}
          <div className="flex items-center justify-between border-t border-bg-brand-weak-pressed pt-3 text-body-14-regular">
            <span className="text-fg-neutral-muted">구매 {summary.count}건</span>
            <span className="text-fg-neutral">총 지출 {formatWon(summary.spent)}</span>
          </div>
        </>
      )}
    </section>
  );
}
