"use client";

import { useState } from "react";
import IconLocationpinFill from "@karrotmarket/react-monochrome-icon/IconLocationpinFill";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { formatDateDot, formatNumber } from "../_lib/format";

// 제보가 표 3열 정렬(제보일 / 오늘 시세 기준 / 가격) — 헤더·행 공통 (Figma F03 node 84:2377).
const ROW_GRID = "grid grid-cols-[140px_1fr_auto] items-center";

const PREVIEW_COUNT = 3;

/** 현재 동 배지 (동네 제보가 헤더). */
export function DistrictBadge() {
  const { district } = useCurrentDistrict();
  return (
    <span className="flex items-center gap-0.5 text-[14px] font-normal tracking-[-0.02em] text-[#4a5667]">
      <span className="text-[#4a5667] [&_svg]:size-4" aria-hidden="true">
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
    return <span className="text-[14px] font-medium tracking-[-0.02em] text-[#99a1b1]">아직 없어요</span>;
  }
  return (
    <span className="text-[14px] font-medium tracking-[-0.02em] text-[#697383]">
      {formatNumber(latest.pricePerKg)}원
    </span>
  );
}

/**
 * 동네 제보가 리스트 (크라우드소싱 결과, 현재 동 기준).
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
      {/* 컬럼 헤더 (Figma node 101:1045) */}
      <div className={`${ROW_GRID} pb-3 text-[13px] font-normal tracking-[-0.02em] text-[#99a1b1]`}>
        <span>제보일</span>
        <span>오늘 시세 기준</span>
        <span className="justify-self-end">가격</span>
      </div>
      <ul className="flex flex-col gap-3">
        {visible.map((r) => {
          // 모든 행에 오늘 시세 대비 플마를 표시(핵심 가치: 눈으로 보는 변화).
          // diff>0 = 제보가가 시세보다 쌈(▼ 초록). 퍼센트 부호는 Figma 규격(쌈=음수, 비쌈=양수).
          const diff = basePrice - r.pricePerKg;
          const cheaper = diff > 0;
          const pct = basePrice > 0 ? ((r.pricePerKg - basePrice) / basePrice) * 100 : 0;
          return (
            <li key={r.id} className={ROW_GRID}>
              <span className="flex flex-col">
                <span className="text-[16px] font-normal tracking-[-0.02em] text-[#697383]">
                  {formatDateDot(r.createdAt.slice(0, 10))}
                </span>
                {/* 구매 장소 공개 — 같은 동 목록이라 별도 라벨 없이 노출(핵심 가치: 이웃 신뢰) */}
                {r.place && (
                  <span className="truncate text-[12px] font-normal tracking-[-0.02em] text-[#99a1b1]">
                    {r.place}
                  </span>
                )}
              </span>
              <span
                className={`flex items-center gap-0.5 text-[12px] font-normal tracking-[-0.02em] ${
                  diff === 0 ? "text-[#99a1b1]" : cheaper ? "text-[#05a163]" : "text-[#fa342c]"
                }`}
              >
                {diff !== 0 && <span aria-hidden="true">{cheaper ? "▼" : "▲"}</span>}
                <span className="sr-only">
                  {diff === 0 ? "오늘 시세와 같음, " : cheaper ? "오늘 시세보다 저렴, " : "오늘 시세보다 비쌈, "}
                </span>
                {formatNumber(Math.abs(diff))}원({pct > 0 ? "+" : ""}
                {pct.toFixed(1)}%)
              </span>
              <span className="justify-self-end text-[16px] font-medium tracking-[-0.02em] text-[#141a24]">
                {formatNumber(r.pricePerKg)}원{" "}
                <span className="font-normal text-[#99a1b1]">/1kg</span>
              </span>
            </li>
          );
        })}
      </ul>

      {reports.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 flex min-h-11 w-full items-center justify-center rounded-lg border border-[#e5e8ef] bg-[#f2f3f8] py-3.5 text-center text-[14px] font-medium tracking-[-0.02em] text-[#697383]"
        >
          {expanded ? "접기" : "제보 내역 더보기"}
        </button>
      )}
    </div>
  );
}
