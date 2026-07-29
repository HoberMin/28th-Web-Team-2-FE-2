"use client";

import { useState } from "react";
import Link from "next/link";
import { LOW_PRICE_RANKING, REPORTER_RANKING } from "../_lib/ranking";
import { formatWon } from "../_lib/format";

type Tab = "price" | "reporter";

// F06 랭킹 — 동 단위 고정. 최저가 순위 / 제보왕 리더보드 두 탭. 더미 데이터(예시).
export function RankingContent() {
  const [tab, setTab] = useState<Tab>("price");

  return (
    <div className="flex flex-col gap-5 px-4 pt-1 pb-6">
      <div role="group" aria-label="랭킹 종류" className="flex gap-1 rounded-xl bg-bg-neutral-weak p-1">
        {(
          [
            { key: "price", label: "오늘의 최저가" },
            { key: "reporter", label: "제보왕" },
          ] as const
        ).map((t) => {
          const selected = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              aria-pressed={selected}
              onClick={() => setTab(t.key)}
              className={`min-h-9 flex-1 rounded-lg py-1.5 text-body-14-medium transition-colors ${
                selected ? "bg-bg-layer-default text-fg-neutral shadow-sm" : "text-fg-neutral-subtle"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <p className="text-caption-12-regular text-fg-neutral-subtle">예시 데이터입니다 · 삼성동 기준</p>

      {tab === "price" ? (
        <ul className="flex flex-col gap-2">
          {LOW_PRICE_RANKING.map((item, i) => (
            <li key={item.vegetableId}>
              <Link
                href={`/prototype/price/${item.vegetableId}`}
                className="flex items-center gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3 active:bg-bg-neutral-weak-pressed"
              >
                <span className="w-5 shrink-0 text-body-16-semibold text-fg-neutral-subtle">{i + 1}</span>
                <span className="text-[28px] leading-none">{item.emoji}</span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-body-16-semibold text-fg-neutral">{item.name}</span>
                  <span className="truncate text-caption-12-regular text-fg-neutral-subtle">{item.place}</span>
                </span>
                <span className="flex flex-col items-end">
                  <span className="text-body-14-medium text-fg-neutral">{formatWon(item.price)}</span>
                  <span className="text-caption-12-regular text-fg-positive">시세보다 {item.discountPct}%↓</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col gap-2">
          {REPORTER_RANKING.map((r) => (
            <li
              key={r.rank}
              className="flex items-center gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3"
            >
              <span className="w-5 shrink-0 text-body-16-semibold text-fg-neutral-subtle">{r.rank}</span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-body-16-semibold text-fg-neutral">{r.nickname}</span>
              </span>
              <span className="text-body-14-medium text-fg-neutral-subtle">제보 {r.reportCount}건</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
