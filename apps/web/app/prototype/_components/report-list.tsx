"use client";

import { useState } from "react";
import IconLocationpinFill from "@karrotmarket/react-monochrome-icon/IconLocationpinFill";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { ANCHOR_DATE } from "../_lib/vegetables";
import { formatDateDot, formatNumber } from "../_lib/format";

const PREVIEW_COUNT = 3;

/** 현재 자치구 배지 (동네 제보가 헤더). */
export function DistrictBadge() {
  const { district } = useCurrentDistrict();
  return (
    <span className="flex items-center gap-0.5 text-body-14-regular text-fg-neutral-subtle">
      <span className="text-fg-brand [&_svg]:size-4" aria-hidden="true">
        <IconLocationpinFill />
      </span>
      {district}
    </span>
  );
}

/** 헤더의 "최근 동네 제보가" — 최신 제보값. 없으면 시세로 위장하지 않고 명시. */
export function LatestReportPrice({ vegetableId }: { vegetableId: string }) {
  const { district } = useCurrentDistrict();
  const reports = useReports({ vegetableId, district });
  const latest = reports[0];
  if (!latest) {
    return <span className="text-fg-neutral-subtle">아직 없어요</span>;
  }
  return <span className="text-fg-neutral-muted">{formatNumber(latest.pricePerKg)}원</span>;
}

/**
 * 동네 제보가 리스트 (크라우드소싱 결과, 현재 자치구 기준).
 * basePrice = 오늘 시세 — 오늘 제보한 실제가와의 플마 차이를 행에 표시(핵심 가치: 눈으로 보는 변화).
 */
export function ReportsList({ vegetableId, basePrice }: { vegetableId: string; basePrice: number }) {
  const { district } = useCurrentDistrict();
  const reports = useReports({ vegetableId, district });
  const [expanded, setExpanded] = useState(false);

  if (reports.length === 0) {
    return (
      <p className="rounded-xl bg-bg-neutral-weak px-4 py-8 text-center text-body-14-regular text-fg-neutral-subtle">
        아직 우리 동네 제보가 없어요.
        <br />
        첫 실제가를 제보해 보세요.
      </p>
    );
  }

  const visible = expanded ? reports : reports.slice(0, PREVIEW_COUNT);

  return (
    <div className="flex flex-col">
      <ul className="flex flex-col gap-3">
        {visible.map((r) => {
          // 오늘 제보한 행만 오늘 시세와의 플마를 표시(+ = 시세보다 저렴, - = 비쌈).
          const isToday = r.createdAt.slice(0, 10) === ANCHOR_DATE;
          const diff = isToday ? basePrice - r.pricePerKg : 0;
          return (
            <li key={r.id} className="flex items-center justify-between gap-2">
              <span className="shrink-0 text-body-16-regular text-fg-neutral-muted">
                {formatDateDot(r.createdAt.slice(0, 10))}
              </span>
              {diff !== 0 && (
                <span
                  className={`flex items-center gap-0.5 text-caption-12-regular ${
                    diff > 0 ? "text-fg-positive" : "text-fg-critical"
                  }`}
                >
                  <span aria-hidden="true">{diff > 0 ? "▼" : "▲"}</span>
                  <span className="sr-only">{diff > 0 ? "오늘 시세보다 저렴, " : "오늘 시세보다 비쌈, "}</span>
                  오늘 기준 {formatNumber(Math.abs(diff))}원
                </span>
              )}
              <span className="shrink-0 text-body-16-medium text-fg-neutral">
                {formatNumber(r.pricePerKg)}원 <span className="text-fg-neutral-subtle">/1kg</span>
              </span>
            </li>
          );
        })}
      </ul>

      {reports.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 min-h-11 rounded-lg border border-stroke-neutral-weak py-2 text-center text-body-14-medium text-fg-neutral-subtle hover:bg-bg-neutral-weak"
        >
          {expanded ? "접기" : "제보 내역 더보기"}
        </button>
      )}
    </div>
  );
}
