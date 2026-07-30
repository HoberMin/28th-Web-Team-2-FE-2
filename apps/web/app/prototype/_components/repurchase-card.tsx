"use client";

import Link from "next/link";
import { useMyReports } from "../_lib/reports-store";
import { getRepurchaseHints } from "../_lib/repurchase";
import { VegetableThumb } from "./vegetable-thumb";

// "살 때 됐어요" — 내 구매 간격에서 재구매 주기를 추정해 알려준다.
// 매번 시세를 확인하러 앱을 켜야 하는 문제를 줄이는 장치(가격 알림의 계산 근거 버전).
// 추정 근거가 얇을 때(구매 1건) 기본값을 쓴다는 사실을 문구로 밝힌다.
export function RepurchaseCard({ todayIso }: { todayIso: string }) {
  const myReports = useMyReports();
  const hints = getRepurchaseHints(myReports, todayIso);
  const due = hints.filter((h) => h.due);

  if (due.length === 0) return null;

  return (
    <section aria-label="살 때 된 야채" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-head2-16 text-fg-neutral">살 때 된 야채</h2>
        <span className="text-caption-12-regular text-fg-neutral-muted">내 구매 간격 기준</span>
      </div>
      <ul className="flex flex-col gap-2">
        {due.map((h) => (
          <li key={h.vegetableId}>
            <Link
              href={`/prototype/price/${h.vegetableId}`}
              className="flex items-center gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3 active:bg-bg-neutral-weak-pressed"
            >
              <VegetableThumb image={h.image} emoji={h.emoji} size="md" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-body-16-semibold text-fg-neutral">{h.name}</span>
                <span className="text-caption-12-regular tabular-nums text-fg-neutral-muted">
                  마지막 구매 {h.daysSince}일 전 · 보통 {h.intervalDays}일마다 사셨어요
                </span>
              </span>
              <span className="shrink-0 text-caption-12-regular text-fg-neutral-muted">시세 보기</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
