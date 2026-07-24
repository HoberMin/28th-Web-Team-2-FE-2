"use client";

import { type PointerEvent as ReactPointerEvent, useRef, useState } from "react";
import type { PricePeriod, PricePoint } from "../_lib/types";
import { formatShortDate, formatWon } from "../_lib/format";
import { InfoTooltip } from "./info-tooltip";

const PERIOD_LABEL: Record<PricePeriod, string> = { week: "일주일", month: "1개월", year: "1년" };
const PERIODS: PricePeriod[] = ["week", "month", "year"];

const VIEW_W = 350;
const VIEW_H = 130;
const PAD_Y = 18;

// Figma 원본 정합 — 인라인 값(디자인 토큰 미대응 색).
const BRAND = "#ff6f00"; // 시세 라인·현재 지점
const TOOLTIP_BG = "rgba(38,47,60,0.9)"; // 그래프 호버 툴팁(Figma gray/900 90%)
const GRID = "#d0d5dd"; // 평균선(점선)

function scaleY(price: number, min: number, range: number): number {
  return PAD_Y + (1 - (price - min) / range) * (VIEW_H - 2 * PAD_Y);
}

export function PriceChart({
  vegetableName,
  series,
}: {
  vegetableName: string;
  series: Record<PricePeriod, PricePoint[]>;
}) {
  const [period, setPeriod] = useState<PricePeriod>("week");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const points = series[period];
  const n = points.length;
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const avg = Math.round(prices.reduce((s, p) => s + p, 0) / n / 10) * 10;

  const coords = points.map((p, i) => ({
    x: n > 1 ? (i / (n - 1)) * VIEW_W : VIEW_W / 2,
    y: scaleY(p.price, min, range),
  }));
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const avgY = scaleY(avg, min, range);

  const idx = activeIdx ?? n - 1;
  const active = coords[idx];
  const activePoint = points[idx];
  const labelIdx = [0, Math.floor((n - 1) / 2), n - 1];

  function handlePointer(e: ReactPointerEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setActiveIdx(Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1)))));
  }

  const xPct = (active.x / VIEW_W) * 100;
  const yPct = (active.y / VIEW_H) * 100;
  // 툴팁 수평 앵커: 실제 x% 위치로 판정(인덱스 아님) — 가장자리에선 안쪽으로 정렬해
  // 잘림을 막고, 오늘(맨 오른쪽, xPct≈100)은 오른쪽 정렬로 패딩 끝에 붙는다.
  // 중앙 점은 -50%로 점 위에 오되, 가장자리 근처 중간 점도 임계 안에서 보정된다.
  const anchor = xPct <= 12 ? "start" : xPct >= 88 ? "end" : "center";
  const tooltipTransform =
    anchor === "start"
      ? "translate(0, -100%)"
      : anchor === "end"
        ? "translate(-100%, -100%)"
        : "translate(-50%, -100%)";
  const arrowPos =
    anchor === "start" ? "left-3" : anchor === "end" ? "right-3" : "left-1/2 -translate-x-1/2";

  return (
    <section className="flex flex-col gap-4" aria-label={`${vegetableName} 시세`}>
      <div className="flex items-center gap-1.5">
        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#141a24]">{vegetableName} 시세</h2>
        <InfoTooltip label={`${vegetableName} 시세`}>
          한국농수산식품유통공사에서 제공한 소매 가격 데이터예요
        </InfoTooltip>
      </div>

      {/* 기간 세그먼트 */}
      <div role="group" aria-label="조회 기간" className="flex rounded-lg bg-[#f2f3f8] p-1">
        {PERIODS.map((p) => {
          const selected = p === period;
          return (
            <button
              key={p}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setPeriod(p);
                setActiveIdx(null);
              }}
              className={`min-h-9 flex-1 rounded-md py-2 text-[14px] font-bold tracking-[-0.02em] transition-colors ${
                selected
                  ? "bg-white text-[#262f3c] shadow-[0px_2px_4px_rgba(0,0,0,0.12)]"
                  : "text-[#99a1b1]"
              }`}
            >
              {PERIOD_LABEL[p]}
            </button>
          );
        })}
      </div>

      {/* 그래프 (터치/호버로 지점 이동) */}
      <div
        ref={containerRef}
        className="relative w-full touch-pan-y"
        onPointerDown={handlePointer}
        onPointerMove={(e) => e.buttons > 0 && handlePointer(e)}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block w-full"
          role="img"
          aria-label={`${PERIOD_LABEL[period]} 시세 추이, ${formatShortDate(activePoint.date)} ${formatWon(activePoint.price)}`}
        >
          <line
            x1="0"
            y1={avgY}
            x2={VIEW_W}
            y2={avgY}
            stroke={GRID}
            strokeWidth="1"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={line}
            fill="none"
            stroke={BRAND}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={active.x} cy={active.y} r="4.5" fill={BRAND} />
        </svg>

        {/* 툴팁 말풍선 */}
        <div
          className="pointer-events-none absolute z-10 flex flex-col items-center gap-1 rounded px-3 py-1.5"
          style={{ left: `${xPct}%`, top: `calc(${yPct}% - 12px)`, transform: tooltipTransform, backgroundColor: TOOLTIP_BG }}
        >
          <p className="text-[14px] font-normal tracking-[-0.02em] whitespace-nowrap text-white">
            {formatShortDate(activePoint.date)}
          </p>
          <p className="text-[14px] font-medium tracking-[-0.02em] whitespace-nowrap text-white">
            {formatWon(activePoint.price)}
          </p>
          <span
            className={`absolute top-full h-0 w-0 border-x-4 border-t-4 border-x-transparent ${arrowPos}`}
            style={{ borderTopColor: TOOLTIP_BG }}
          />
        </div>
      </div>

      {/* x축 라벨 */}
      <div className="flex justify-between px-1 text-[14px] font-medium tracking-[-0.02em] text-[#4a5667]">
        {labelIdx.map((li, i) => (
          <span key={i}>{formatShortDate(points[li].date)}</span>
        ))}
      </div>

      {/* 선택 기간 평균가 */}
      <div className="flex items-center justify-between rounded-lg border border-[#e5e8ef] px-4 py-3.5">
        <span className="text-[14px] font-medium tracking-[-0.02em] text-[#262f3c]">평균가</span>
        <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#141a24]">{formatWon(avg)}</span>
      </div>
    </section>
  );
}
