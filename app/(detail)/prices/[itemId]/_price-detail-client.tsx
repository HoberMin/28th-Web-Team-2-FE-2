"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { SheetHandle } from "@/app/_components/sheet-handle";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { formatWon } from "@/app/_lib/format";
import type { PricePeriod, PricePoint } from "@/app/_lib/types";

export interface PriceDetailReport {
  id: string;
  reportedAt: number;
  place: string;
  age: string;
  price: number;
  unit: string;
  diff: number;
  diffPercent: number;
}

interface NeighborhoodPricesProps {
  reports: PriceDetailReport[];
}

type ReportSort = "cheap" | "recent";

const DETAIL_SECTIONS = [
  { id: "neighborhood-prices", label: "동네 제보가" },
  { id: "public-price", label: "공공 시세" },
  { id: "online-prices", label: "온라인가 비교" },
] as const;

export function PriceSectionNav() {
  const [active, setActive] = useState<(typeof DETAIL_SECTIONS)[number]["id"]>(
    "neighborhood-prices",
  );

  useEffect(() => {
    const sections = DETAIL_SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null,
    );
    const scroller = sections[0]?.closest("main");
    if (!scroller) return;

    const nav = scroller.querySelector<HTMLElement>('nav[aria-label="시세 상세 섹션"]');
    const activationOffset = Math.max(nav?.offsetHeight ?? 44, scroller.clientHeight * 0.45);
    const scrollerTop = scroller.getBoundingClientRect().top;
    const sectionTop = (section: HTMLElement) =>
      section.getBoundingClientRect().top - scrollerTop + scroller.scrollTop;

    const updateActiveSection = () => {
      const reached = sections
        .filter((section) => sectionTop(section) <= scroller.scrollTop + activationOffset)
        .at(-1);
      setActive(
        (reached?.id ?? sections[0]?.id ?? "neighborhood-prices") as (typeof DETAIL_SECTIONS)[number]["id"],
      );
    };

    const hashId = window.location.hash.slice(1);
    const hashSection = sections.find((section) => section.id === hashId);
    if (hashSection) {
      scroller.scrollTo({ top: sectionTop(hashSection) - (nav?.offsetHeight ?? 44) });
    }
    updateActiveSection();
    scroller.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => scroller.removeEventListener("scroll", updateActiveSection);
  }, []);

  const moveToSection = (
    event: MouseEvent<HTMLAnchorElement>,
    id: (typeof DETAIL_SECTIONS)[number]["id"],
  ) => {
    event.preventDefault();
    const section = document.getElementById(id);
    const scroller = section?.closest("main");
    const nav = scroller?.querySelector<HTMLElement>('nav[aria-label="시세 상세 섹션"]');
    if (!section || !scroller) return;

    const top =
      section.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop -
      (nav?.offsetHeight ?? 44);
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
    scroller.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="시세 상세 섹션"
      className="sticky top-0 z-10 flex h-11 items-end gap-5 border-b border-border-secondary bg-surface-primary px-4 shadow-[0_2px_3px_rgba(0,0,0,0.04)]"
    >
      {DETAIL_SECTIONS.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={active === id ? "location" : undefined}
          onClick={(event) => moveToSection(event, id)}
          className={`flex h-full items-center border-b-2 pt-1 text-body-16-medium focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary ${active === id ? "border-border-tertiary text-body-16-bold text-content-primary" : "border-transparent text-content-disabled"}`}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

export function NeighborhoodPrices({ reports }: NeighborhoodPricesProps) {
  const [sort, setSort] = useState<ReportSort>("recent");
  const [sheetOpen, setSheetOpen] = useState(false);
  const sorted = useMemo(
    () =>
      reports.toSorted((a, b) =>
        sort === "cheap" ? a.price - b.price : b.reportedAt - a.reportedAt,
      ),
    [reports, sort],
  );
  const visible = sorted.slice(0, 3);

  return (
    <section id="neighborhood-prices" className="scroll-mt-12 px-4 py-8">
      <div
        role="group"
        aria-label="동네 제보가 정렬"
        className="flex w-full gap-1 rounded-md bg-surface-secondary p-0.5"
      >
        <SortButton selected={sort === "cheap"} onClick={() => setSort("cheap")}>
          저렴한 순
        </SortButton>
        <SortButton selected={sort === "recent"} onClick={() => setSort("recent")}>
          최신순
        </SortButton>
      </div>

      {visible.length > 0 ? (
        <NeighborhoodReportList reports={visible} className="mt-3" />
      ) : (
        <p className="py-10 text-center text-body-14-medium text-content-secondary">
          아직 이 동네의 제보가 없어요.
        </p>
      )}

      {reports.length > 0 ? (
        <button
          type="button"
          className="mt-1 flex min-h-9.5 w-full items-center justify-center rounded-md border border-border-primary px-5 py-2 text-body-14-medium text-content-secondary"
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          onClick={() => setSheetOpen(true)}
        >
          더보기
        </button>
      ) : null}

      <NeighborhoodPricesSheet
        open={sheetOpen}
        reports={sorted}
        onOpenChange={setSheetOpen}
      />
    </section>
  );
}

function NeighborhoodReportList({
  reports,
  className,
}: {
  reports: PriceDetailReport[];
  className?: string;
}) {
  return (
    <ul className={className}>
      {reports.map((report, index) => {
        const direction = report.diff < 0 ? "down" : report.diff > 0 ? "up" : "flat";
        const signedPercent = `${report.diffPercent > 0 ? "+" : "-"}${Math.abs(report.diffPercent).toFixed(1)}%`;

        return (
          <li
            key={report.id}
            className={index === reports.length - 1 ? "" : "border-b border-border-secondary"}
          >
            <div className="flex min-h-19 items-start justify-between px-2 py-4">
              <p className="min-w-0 truncate text-body-16-medium text-content-primary">
                {report.place}
                <span aria-hidden="true" className="mx-1 text-content-disabled">·</span>
                <span className="text-caption-12-medium text-content-disabled">{report.age}</span>
              </p>
              <div className="flex w-41 shrink-0 flex-col items-end gap-0.5">
                <p className="flex items-center gap-1 whitespace-nowrap">
                  <span className="text-body-16-bold text-content-primary">
                    {formatWon(report.price)}
                  </span>
                  <span className="text-caption-12-regular text-content-disabled">
                    /{report.unit}
                  </span>
                </p>
                {direction === "flat" ? (
                  <span className="text-caption-12-medium text-trend-flat">변동 없음</span>
                ) : (
                  <span
                    className={`flex items-center text-caption-12-medium ${direction === "down" ? "text-trend-down" : "text-trend-up"}`}
                  >
                    <FigmaIcon name={`trend-${direction}`} width={16} />
                    {formatWon(Math.abs(report.diff))}({signedPercent})
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function NeighborhoodPricesSheet({
  open,
  reports,
  onOpenChange,
}: {
  open: boolean;
  reports: PriceDetailReport[];
  onOpenChange: (open: boolean) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current) onOpenChange(false);
      }}
      className="mx-auto mt-auto mb-0 max-h-[66dvh] w-full max-w-97.5 overflow-hidden rounded-t-3xl border-0 bg-transparent p-0 backdrop:bg-overlay-dim"
    >
      <div className="flex max-h-[66dvh] flex-col items-center rounded-t-3xl bg-surface-primary px-4 pt-2 pb-8">
        <SheetHandle />
        <div className="mt-4 flex min-h-0 w-full flex-1 flex-col">
          <h2 id={titleId} className="shrink-0 text-title-18-semibold text-content-primary">
            동네 제보가
          </h2>
          <NeighborhoodReportList reports={reports} className="mt-2 min-h-0 flex-1 overflow-y-auto" />
        </div>
      </div>
    </dialog>
  );
}

function SortButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-10 flex-1 rounded-md border border-border-secondary p-2 ${selected ? "bg-surface-primary text-body-14-bold text-content-primary" : "bg-surface-secondary text-body-14-semibold text-content-secondary"}`}
    >
      {children}
    </button>
  );
}

interface PublicPriceChartProps {
  series: Record<PricePeriod, PricePoint[]>;
}

const PERIOD_LABEL: Record<PricePeriod, string> = {
  week: "일주일",
  month: "1개월",
  year: "1년",
};

export function PublicPriceChart({ series }: PublicPriceChartProps) {
  const [period, setPeriod] = useState<PricePeriod>("week");
  const points = series[period];
  const average = points.reduce((sum, point) => sum + point.price, 0) / Math.max(points.length, 1);
  const chart = buildChart(points);

  return (
    <section id="public-price" className="scroll-mt-12 px-4 py-8">
      <div
        role="group"
        aria-label="공공 시세 조회 기간"
        className="flex w-full gap-1 rounded-md bg-surface-secondary p-0.5"
      >
        {(Object.keys(PERIOD_LABEL) as PricePeriod[]).map((value) => (
          <SortButton key={value} selected={period === value} onClick={() => setPeriod(value)}>
            {PERIOD_LABEL[value]}
          </SortButton>
        ))}
      </div>

      <div className="mt-7 flex flex-col gap-4">
        <div className="relative h-46 w-full overflow-hidden" aria-label={`${PERIOD_LABEL[period]} 공공 시세 그래프`}>
          <svg
            viewBox="0 0 358 184"
            role="img"
            aria-label={`${PERIOD_LABEL[period]} 공공 시세 변화`}
            className="size-full overflow-visible"
          >
            {[0, 89, 178, 267, 356].map((x) => (
              <line key={x} x1={x} y1="5" x2={x} y2="162" stroke="var(--color-border-secondary)" strokeWidth="1" />
            ))}
            {chart.path ? (
              <path d={chart.path} fill="none" stroke="var(--color-content-brand-light)" strokeWidth="1.5" />
            ) : null}
            {chart.latest ? (
              <>
                <circle cx={chart.latest.x} cy={chart.latest.y} r="12" fill="var(--color-green-100)" />
                <circle cx={chart.latest.x} cy={chart.latest.y} r="5" fill="var(--color-content-brand-light)" />
              </>
            ) : null}
          </svg>

          {chart.latest ? (
            <div
              className="absolute -translate-x-1/2 -translate-y-full rounded-sm bg-surface-inverse px-3 py-1.5 text-center text-content-inverse after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-x-6 after:border-t-6 after:border-x-transparent after:border-t-surface-inverse"
              style={{ left: `${(chart.latest.x / 358) * 100}%`, top: `${chart.latest.y - 10}px` }}
            >
              <p className="text-caption-12-regular">오늘</p>
              <p className="text-caption-12-medium">{formatWon(chart.latest.price)}</p>
            </div>
          ) : null}

          {chart.labels.map((label, index) => (
            <span
              key={`${label.date}-${label.x}`}
              className={`absolute top-41.75 text-caption-12-regular text-content-secondary ${index === 0 ? "" : "-translate-x-1/2"}`}
              style={{ left: `${(label.x / 358) * 100}%` }}
            >
              {label.label}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-md border border-border-secondary p-3">
          <span className="text-body-14-medium text-content-secondary">{PERIOD_LABEL[period]} 평균가</span>
          <strong className="text-body-16-semibold text-content-primary">{formatWon(average)}</strong>
        </div>
      </div>
    </section>
  );
}

function buildChart(points: PricePoint[]) {
  const width = 267;
  const top = 8;
  const bottom = 128;
  const values = points.map((point) => point.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const coordinates = points.map((point, index) => ({
    date: point.date,
    price: point.price,
    x: points.length === 1 ? 0 : (index / (points.length - 1)) * width,
    y: top + ((max - point.price) / range) * (bottom - top),
  }));
  const path = coordinates.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  const labelIndexes = Array.from(new Set([0, Math.round((points.length - 1) / 3), Math.round(((points.length - 1) * 2) / 3), points.length - 1]));

  return {
    path,
    latest: coordinates.at(-1),
    labels: labelIndexes.map((index) => ({
      ...coordinates[index],
      label: points[index] ? formatChartDate(points[index].date) : "",
    })),
  };
}

function formatChartDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${month}/${day}`;
}
