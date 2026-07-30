"use client";

import { type KeyboardEvent, type PointerEvent as ReactPointerEvent, useRef, useState } from "react";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import type { PricePeriod, PricePoint } from "../_lib/types";
import { formatMonthLabel, formatShortDate, formatWon } from "../_lib/format";
import { InfoTooltip } from "./info-tooltip";

const PERIOD_LABEL: Record<PricePeriod, string> = { week: "일주일", month: "1개월", year: "1년" };
const PERIODS: PricePeriod[] = ["week", "month", "year"];

const VIEW_W = 350;
const VIEW_H = 130;
const PAD_Y = 18;
// 오른쪽 여백 — 최신 점을 가장자리에 붙이지 않아 툴팁이 점 기준 중앙에 뜬다 (Figma 84:2377, 약 10%).
const PAD_RIGHT = 38;
const PLOT_W = VIEW_W - PAD_RIGHT;

// 색은 전부 토큰이다. 이전엔 여기에 hex를 박아 두 가지 문제가 있었다:
//   ① #ff6f00 은 브랜드색(carrot-600 #ff6600)과 미묘하게 달라 앱 안에 주황이 두 개 있었다
//   ② 토큰이 바뀌어도 그래프만 옛 색으로 남는다
// SVG는 Tailwind stroke-*/fill-* 유틸이 --color-* 를 그대로 읽는다.
const TOOLTIP_BG = "var(--color-bg-neutral-inverted)"; // 호버 툴팁 배경

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
    x: n > 1 ? (i / (n - 1)) * PLOT_W : PLOT_W / 2,
    y: scaleY(p.price, min, range),
  }));
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const avgY = scaleY(avg, min, range);

  const idx = activeIdx ?? n - 1;
  const active = coords[idx];
  const activePoint = points[idx];
  const labelIdx = [0, Math.floor((n - 1) / 2), n - 1];
  // 1년 축은 월별 시리즈라 "7월"로, 나머지는 "7/24"로 표기.
  const axisLabel = period === "year" ? formatMonthLabel : formatShortDate;

  function handlePointer(e: ReactPointerEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setActiveIdx(Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1)))));
  }

  // 키보드 지점 이동 — ←/→ 한 칸, Home/End 양 끝.
  function handleKey(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
    if (step === 0 && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? n - 1 : Math.max(0, Math.min(n - 1, idx + step));
    setActiveIdx(next);
  }

  const xPct = (active.x / VIEW_W) * 100;
  const yPct = (active.y / VIEW_H) * 100;
  // 툴팁 수평 앵커: 실제 x% 위치로 판정(인덱스 아님) — 가장자리에선 안쪽으로 정렬해 잘림을 막는다.
  // 최신 점은 PAD_RIGHT 여백 덕에 xPct≈89%라 "center"로 잡혀 점 기준 중앙에 뜬다 (Figma 84:2377).
  const anchor = xPct <= 5 ? "start" : xPct >= 95 ? "end" : "center";
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
        <h2 className="text-head2-18 text-fg-neutral">{vegetableName} 시세</h2>
        <InfoTooltip label={`${vegetableName} 시세`}>
          한국농수산식품유통공사에서 제공한 소매 가격 데이터예요
        </InfoTooltip>
      </div>

      {/* 기간 세그먼트 — 랭킹·마이페이지·제보 폼과 같은 seed 컴포넌트를 쓴다.
          이전엔 여기만 손으로 만든 버튼 묶음이라 같은 앱에 세그먼트 생김새가 두 종류였다
          (게다가 text-[14px] arbitrary value였다). */}
      <SegmentedControl
        aria-label="조회 기간"
        value={period}
        onValueChange={(v) => {
          setPeriod(v as PricePeriod);
          setActiveIdx(null);
        }}
      >
        {PERIODS.map((p) => (
          <SegmentedControlItem key={p} value={p}>
            {PERIOD_LABEL[p]}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>

      {/* 그래프 — 터치·호버로 지점 이동, 키보드는 ←/→ 로 이동한다.
          이전엔 포인터 전용이라 키보드 사용자는 최신 지점 하나만 볼 수 있었다(WCAG 2.1.1). */}
      <div
        ref={containerRef}
        role="group"
        aria-label={`${vegetableName} 시세 그래프 — 좌우 화살표로 날짜 이동`}
        tabIndex={0}
        className="relative w-full touch-pan-y"
        onPointerDown={handlePointer}
        onPointerMove={(e) => e.buttons > 0 && handlePointer(e)}
        onKeyDown={handleKey}
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
            className="stroke-bg-neutral-weak-pressed"
            strokeWidth="1"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={line}
            fill="none"
            className="stroke-bg-brand-solid"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={active.x} cy={active.y} r="4.5" className="fill-bg-brand-solid" />
        </svg>

        {/* 툴팁 말풍선 */}
        <div
          className="pointer-events-none absolute z-10 flex flex-col items-center gap-1 rounded px-3 py-1.5"
          style={{ left: `${xPct}%`, top: `calc(${yPct}% - 12px)`, transform: tooltipTransform, backgroundColor: TOOLTIP_BG }}
        >
          <p className="text-body-14-regular whitespace-nowrap text-fg-neutral-inverted">
            {formatShortDate(activePoint.date)}
          </p>
          <p className="text-body-14-medium whitespace-nowrap text-fg-neutral-inverted">
            {formatWon(activePoint.price)}
          </p>
          <span
            className={`absolute top-full h-0 w-0 border-x-4 border-t-4 border-x-transparent ${arrowPos}`}
            style={{ borderTopColor: TOOLTIP_BG }}
          />
        </div>
      </div>

      {/* x축 라벨 — 점 x좌표를 따라 배치(첫 점은 좌측 정렬, 이후는 점 중앙). */}
      <div className="relative h-[17px] text-body-14-medium text-fg-neutral">
        {labelIdx.map((li, i) => {
          const leftPct = (coords[li].x / VIEW_W) * 100;
          return (
            <span
              key={i}
              className="absolute whitespace-nowrap"
              style={{
                left: `${leftPct}%`,
                transform: i === 0 ? undefined : "translateX(-50%)",
              }}
            >
              {axisLabel(points[li].date)}
            </span>
          );
        })}
      </div>

      {/* 선택 기간 평균가 — 세그먼트를 바꾸면 값도 바뀌므로 기간을 라벨에 명시한다 */}
      <div className="flex items-center justify-between rounded-lg border border-bg-neutral-weak-pressed px-4 py-3.5">
        <span className="text-body-14-medium text-fg-neutral">{PERIOD_LABEL[period]} 평균가</span>
        <span className="text-body-16-semibold text-fg-neutral">{formatWon(avg)}</span>
      </div>
    </section>
  );
}
