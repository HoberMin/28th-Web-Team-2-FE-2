"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { SheetHandle } from "@/app/_components/sheet-handle";
import { PRICE_DETAIL_HEADER_HEIGHT } from "./_detail-header";
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
    const stickyOffset = (nav?.offsetHeight ?? 44) + PRICE_DETAIL_HEADER_HEIGHT;
    const activationOffset = Math.max(stickyOffset, scroller.clientHeight * 0.45);
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
      scroller.scrollTo({ top: sectionTop(hashSection) - stickyOffset });
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
      ((nav?.offsetHeight ?? 44) + PRICE_DETAIL_HEADER_HEIGHT);
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
    scroller.scrollTo({ top, behavior: "smooth" });
  };

  return (
    // Figma `tab-section`(1116:11888) 실측 2026-08-21:
    //   bar   h-[44px] · bg surface/primary · border-b border/secondary · **그림자 없음**
    //   row   gap-[20px] · left 15.65(≈px-4) · 아래 정렬
    //   item  py-[4px]
    //     selected  border-b-**2** border/tertiary · body/16-**bold**   · content/primary
    //     default   border-b-**1** border/secondary · body/16-medium   · content/disabled
    <nav
      aria-label="시세 상세 섹션"
      // top-12.25(49px) — 스크롤하면 나타나는 헤더 **아래에** 붙는다. top-0으로 두면 헤더(z-20)가
      // 이 탭을 완전히 덮어 "스티키가 사라진" 것처럼 보인다. Figma도 헤더 44~93 · 탭 92~136으로
      // 위아래로 쌓아 두었다(639:8119 · 639:11447).
      className="sticky top-12.25 z-10 flex h-11 items-end gap-5 border-b border-border-secondary bg-surface-primary px-4"
    >
      {DETAIL_SECTIONS.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={active === id ? "location" : undefined}
          onClick={(event) => moveToSection(event, id)}
          // ⚠️ 선택/비선택 클래스는 **완전히 상호배타**로 둔다. 공통 부분에 `text-body-16-medium`을
          //    두고 선택 분기에서 `text-body-16-bold`를 덧붙이면, cn/문자열 연결은 tailwind-merge가
          //    아니라 단순 이어붙이기라 승자가 `@theme` 선언 순서(bold가 medium보다 먼저 선언 →
          //    medium이 뒤에 emit → medium이 이김)로 정해진다. 실제로 이 자리가 그래서
          //    UI QA 2026-08-20 #29("selected 텍스트가 디자인보다 얇음")를 고쳤는데도
          //    화면에서는 계속 medium으로 보였다. (2026-08-21 재수정)
          className={`flex h-full items-center pt-1 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary ${
            active === id
              ? "border-b-2 border-border-tertiary text-body-16-bold text-content-primary"
              : "border-b border-border-secondary text-body-16-medium text-content-disabled"
          }`}
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
    <section id="neighborhood-prices" className="scroll-mt-23.25 px-4 py-8">
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

export function OnlinePriceNotice() {
  const [open, setOpen] = useState(false);
  const descriptionId = useId();

  return (
    <div className="mt-6">
      <div className="flex items-center gap-1">
        {/*
          UI QA 2026-08-20 #31 "comment-section-notice의 텍스트와 아이콘이 디자인과 다름".
          08-20에는 이 항목을 **댓글 섹션 이야기로 잘못 읽었다** — Figma의 `comment-section`은
          댓글이 아니라 온라인가 비교 섹션의 프레임 이름이다(이름이 안 갱신된 자리, 디자인팀 확인 항목).
          실측 1116:11932 — 문구는 body/14-**medium** · content/**disabled**,
          아이콘은 `icon/information-circle-2` 20px.
          ⚠️ 아이콘 원본(information-circle-2)은 아직 레포에 없다. 지금 쓰는
             `information-circle.svg`는 16px PNG를 SVG로 감싼 파일이라 20px로 늘리면 뭉갠다
             — 아이콘 일괄 교체 때 같이 받는다.
        */}
        <p className="text-body-14-medium text-content-disabled">
          온라인 사이트마다 배송 조건이 달라요
        </p>
        <button
          type="button"
          aria-label="온라인 가격 비교 안내 보기"
          aria-expanded={open}
          aria-controls={descriptionId}
          onClick={() => setOpen((value) => !value)}
          className="flex size-6 items-center justify-center rounded-full focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
        >
          <FigmaIcon name="information-circle" width={20} />
        </button>
      </div>
      {open ? (
        <div
          id={descriptionId}
          className="mt-2 flex items-start justify-between gap-2 rounded-md border border-border-secondary bg-surface-primary p-3 shadow-[0_2px_8px_rgba(38,47,60,0.08)]"
        >
          <p className="text-body-14-medium text-content-secondary">
            <span className="block">배송 조건이 달라 비교가 어려울 수 있어요.</span>
            <span className="block">오프라인 동네 가격을 기준으로, 온라인은 참고만 해주세요.</span>
          </p>
          <button
            type="button"
            aria-label="온라인 가격 비교 안내 닫기"
            onClick={() => setOpen(false)}
            className="flex size-6 shrink-0 items-center justify-center"
          >
            <FigmaIcon name="close-header-20" width={20} />
          </button>
        </div>
      ) : null}
    </div>
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
      className="mx-auto mt-auto mb-0 max-h-[66dvh] w-full max-w-97.5 overflow-hidden rounded-t-3xl border-0 bg-transparent p-0 outline-none backdrop:bg-overlay-dim"
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
      // UI QA 2026-08-20 #30 "filter/sort-toggle가 이전 버전임 → 최신 디자인(filter/sort-segment)
      // 으로 업데이트. 컬러가 달라요".
      // Figma `filter/sort-segment`(1157:21343) 실측:
      //   선택   bg content/selected(#354153) · border 같은 색 · content/inverse · body/14-semibold
      //   미선택 bg surface/secondary        · border border/secondary · content/secondary · body/14-medium
      // 전에는 선택을 "흰 배경 + 진한 글씨"로 반전시켜 두어 선택/미선택 대비가 뒤바뀌어 있었다.
      className={`min-h-10 flex-1 rounded-md border p-2 ${
        selected
          ? "border-content-selected bg-content-selected text-body-14-semibold text-content-inverse"
          : "border-border-secondary bg-surface-secondary text-body-14-medium text-content-secondary"
      }`}
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
    <section id="public-price" className="scroll-mt-23.25 px-4 py-8">
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
              style={{ left: `${(chart.latest.x / 358) * 100}%`, top: `${Math.max(chart.latest.y - 10, TOOLTIP_MIN_TOP)}px` }}
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

// 툴팁(text-caption-12 두 줄 + py-1.5)의 렌더 높이 근사치. -translate-y-full로 자기 높이만큼
// 위로 밀리므로, top이 이 값보다 작으면 그래프 컨테이너 상단 밖으로 잘려 보이지 않는다.
const TOOLTIP_MIN_TOP = 50;

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
