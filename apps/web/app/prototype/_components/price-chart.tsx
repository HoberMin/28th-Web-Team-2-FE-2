"use client";

import { useState } from "react";
import type { PricePeriod, PricePoint } from "../_lib/types";
import { formatShortDate, formatWon } from "../_lib/format";

const PERIOD_LABEL: Record<PricePeriod, string> = {
  week: "일주일",
  month: "1개월",
  year: "1년",
};
const PERIODS: PricePeriod[] = ["week", "month", "year"];

const VIEW_W = 350;
const VIEW_H = 130;
const PAD_Y = 16;

function buildPaths(points: PricePoint[]) {
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = points.length > 1 ? (i / (points.length - 1)) * VIEW_W : VIEW_W / 2;
    const y = PAD_Y + (1 - (p.price - min) / range) * (VIEW_H - 2 * PAD_Y);
    return { x, y };
  });
  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${VIEW_W} ${VIEW_H} L0 ${VIEW_H} Z`;
  return { coords, line, area, last: coords[coords.length - 1] };
}

export function PriceChart({
  vegetableName,
  series,
}: {
  vegetableName: string;
  series: Record<PricePeriod, PricePoint[]>;
}) {
  const [period, setPeriod] = useState<PricePeriod>("week");
  const points = series[period];
  const { line, area, last } = buildPaths(points);
  const lastPoint = points[points.length - 1];
  const labelIdx = [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <section className="flex flex-col gap-4" aria-label={`${vegetableName} 시세 그래프`}>
      <h2 className="text-head2-16 text-fg-neutral">{vegetableName} 시세 그래프</h2>

      {/* 기간 세그먼트 */}
      <div role="group" aria-label="조회 기간" className="flex gap-1 rounded-xl bg-bg-neutral-weak p-1">
        {PERIODS.map((p) => {
          const selected = p === period;
          return (
            <button
              key={p}
              type="button"
              aria-pressed={selected}
              onClick={() => setPeriod(p)}
              className={`min-h-11 flex-1 rounded-lg py-2 text-body-14-medium transition-colors ${
                selected
                  ? "bg-bg-layer-default text-fg-neutral shadow-sm"
                  : "text-fg-neutral-subtle"
              }`}
            >
              {PERIOD_LABEL[p]}
            </button>
          );
        })}
      </div>

      {/* 그래프 */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-32 w-full"
          role="img"
          aria-label={`${PERIOD_LABEL[period]} 시세 추이, 현재 ${formatWon(lastPoint.price)}`}
        >
          <defs>
            <linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--seed-color-bg-brand-solid)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--seed-color-bg-brand-solid)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#priceArea)" />
          <path
            d={line}
            fill="none"
            stroke="var(--seed-color-bg-brand-solid)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx={last.x} cy={last.y} r={4.5} fill="var(--seed-color-bg-brand-solid)" />
          <circle cx={last.x} cy={last.y} r={8} fill="var(--seed-color-bg-brand-solid)" fillOpacity={0.2} />
        </svg>
      </div>

      {/* x축 라벨 */}
      <div className="flex justify-between px-1 text-caption-12-regular text-fg-neutral-subtle">
        {labelIdx.map((idx, i) => (
          <span key={i}>{formatShortDate(points[idx].date)}</span>
        ))}
      </div>
    </section>
  );
}
