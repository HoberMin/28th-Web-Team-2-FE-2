"use client";

import { useState } from "react";
import Link from "next/link";
import IconLocationpinFill from "@karrotmarket/react-monochrome-icon/IconLocationpinFill";
import { useNearbyDistrictReports, useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { formatDateDot, formatNumber } from "../_lib/format";
import { countCrossChecks, getFreshness, isOutlier } from "../_lib/stores";
import type { Report } from "../_lib/types";

// 제보가 표 3열 정렬(제보일 / 오늘 시세 기준 / 가격) — 헤더·행 공통 (Figma F03 node 84:2377).
// 색·크기는 seed 토큰으로 통일했다(이전엔 Figma hex를 직접 박아 같은 화면 안에 두 색 체계가 섞였다).
const ROW_GRID = "grid grid-cols-[132px_1fr_auto] items-start gap-2";

const PREVIEW_COUNT = 3;

/** 현재 동 배지 (동네 제보가 헤더). */
export function DistrictBadge() {
  const { district } = useCurrentDistrict();
  return (
    <span className="flex items-center gap-0.5 text-body-14-regular text-fg-neutral">
      <span className="[&_svg]:size-4" aria-hidden="true">
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
    return <span className="text-body-14-medium text-fg-neutral-subtle">아직 없어요</span>;
  }
  return (
    <span className="text-body-14-medium tabular-nums text-fg-neutral">
      {formatNumber(latest.pricePerKg)}원
    </span>
  );
}

/**
 * 동네 제보가 리스트 (크라우드소싱 결과, 현재 동 기준).
 * basePrice = 오늘 시세 — 제보한 실제가와의 플마 차이를 행에 표시(핵심 가치: 눈으로 보는 변화).
 *
 * 신뢰 장치 3개가 여기 붙는다:
 *   신선도  — 야채 가격은 주 단위로 움직여 1주일 넘은 제보는 흐리게 + 경고
 *   교차검증 — 같은 가게·같은 품목 제보가 2건 이상이면 "이웃 N명 확인"
 *   이상치  — 시세의 3배/⅓ 밖 제보는 목록 맨 아래로 내리고 "확인 필요"로 표시(삭제하지 않는다)
 */
export function ReportsList({
  vegetableId,
  basePrice,
  todayIso,
  unit,
}: {
  vegetableId: string;
  basePrice: number;
  todayIso: string;
  unit: string;
}) {
  const { district } = useCurrentDistrict();
  const all = useReports({ vegetableId, district });
  const districtReports = useReports({ district });
  // 훅은 early return 앞에 전부 호출한다(conventions #8) — 우리 동네가 비었을 때만 쓰이는 값이지만
  // 조건부로 호출할 수 없다.
  const nearbyGroups = useNearbyDistrictReports(vegetableId, district);
  const [expanded, setExpanded] = useState(false);

  // 우리 동네 제보가 0건이면 **근처 동네**를 보여준다(콜드스타트).
  // 빈 화면만 보여주면 "쓸 데이터가 없는 앱"으로 판단하고 떠난다. 정확도는 낮지만 어느 동네
  // 값인지 밝히면 오해가 없고, 아무것도 없는 것보다 낫다.
  if (all.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-xl bg-bg-neutral-weak px-4 py-6 text-center text-body-14-regular text-fg-neutral-subtle">
          아직 {district} 제보가 없어요.
          <br />
          첫 실제가를 제보해 주시면 이웃이 헛걸음하지 않아요.
        </p>

        {nearbyGroups.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-caption-12-regular text-fg-neutral-subtle">
              대신 근처 동네 가격을 참고하세요
            </p>
            <ul className="flex flex-col gap-2">
              {nearbyGroups.map((group) => {
                const latest = group.reports[0];
                const diff = basePrice - latest.pricePerKg;
                return (
                  <li
                    key={group.district}
                    className="flex items-center justify-between gap-2 rounded-xl bg-bg-neutral-weak px-4 py-3"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="text-body-14-medium text-fg-neutral">{group.district}</span>
                      <span className="text-caption-12-regular text-fg-neutral-subtle">
                        {getFreshness(latest.createdAt, todayIso).label} · 제보 {group.reports.length}건
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end">
                      <span className="text-body-14-medium tabular-nums text-fg-neutral">
                        {formatNumber(latest.pricePerKg)}원
                        <span className="text-fg-neutral-subtle"> /{unit}</span>
                      </span>
                      <span
                        className={`text-caption-12-regular tabular-nums ${
                          diff > 0 ? "text-fg-positive" : "text-fg-neutral-subtle"
                        }`}
                      >
                        시세 {diff > 0 ? "−" : "+"}
                        {formatNumber(Math.abs(diff))}원
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // 이상치는 지우지 않고 맨 아래로 — 판단을 흐리지 않으면서 기록은 남긴다.
  const normal: Report[] = [];
  const outliers: Report[] = [];
  for (const r of all) {
    if (isOutlier(r.pricePerKg, basePrice)) outliers.push(r);
    else normal.push(r);
  }
  const ordered = [...normal, ...outliers];
  const visible = expanded ? ordered : ordered.slice(0, PREVIEW_COUNT);

  return (
    <div className="flex flex-col">
      {/* 컬럼 헤더 (Figma node 101:1045) */}
      <div className={`${ROW_GRID} pb-3 text-caption-12-regular text-fg-neutral-subtle`}>
        <span>제보일</span>
        <span>오늘 시세 기준</span>
        <span className="justify-self-end">가격</span>
      </div>
      <ul className="flex flex-col gap-3">
        {visible.map((r) => {
          // diff>0 = 제보가가 시세보다 쌈(▼ 초록). 퍼센트 부호는 Figma 규격(쌈=음수, 비쌈=양수).
          const diff = basePrice - r.pricePerKg;
          const cheaper = diff > 0;
          const pct = basePrice > 0 ? ((r.pricePerKg - basePrice) / basePrice) * 100 : 0;
          const freshness = getFreshness(r.createdAt, todayIso);
          const crossChecks = r.place ? countCrossChecks(districtReports, r.place, vegetableId) : 0;
          const outlier = isOutlier(r.pricePerKg, basePrice);

          return (
            <li key={r.id} className={`${ROW_GRID} ${outlier ? "opacity-60" : ""}`}>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span
                  className={`text-body-16-regular ${
                    freshness.level === "stale" ? "text-fg-neutral-subtle" : "text-fg-neutral"
                  }`}
                >
                  {formatDateDot(r.createdAt.slice(0, 10))}
                </span>
                {/* 구매 장소 공개 — 가게명을 누르면 그 가게의 전 품목 가격으로 간다(가게 축) */}
                {r.place && (
                  <Link
                    href={`/prototype/store/${encodeURIComponent(r.place)}`}
                    className="truncate text-caption-12-regular text-fg-neutral-subtle underline decoration-dotted"
                  >
                    {r.place}
                  </Link>
                )}
                <span className="flex flex-wrap items-center gap-1">
                  {freshness.level === "stale" ? (
                    <span className="text-caption-12-regular text-fg-warning">
                      {freshness.label} · 오래됨
                    </span>
                  ) : (
                    <span className="text-caption-12-regular text-fg-neutral-subtle">
                      {freshness.label}
                    </span>
                  )}
                  {crossChecks >= 2 && (
                    <span className="rounded bg-bg-positive-weak px-1 py-0.5 text-caption-12-regular text-fg-positive">
                      {crossChecks}명 확인
                    </span>
                  )}
                </span>
              </span>

              <span
                className={`flex items-center gap-0.5 text-caption-12-regular tabular-nums ${
                  outlier
                    ? "text-fg-warning"
                    : diff === 0
                      ? "text-fg-neutral-subtle"
                      : cheaper
                        ? "text-fg-positive"
                        : "text-fg-critical"
                }`}
              >
                {outlier ? (
                  "확인 필요"
                ) : (
                  <>
                    {diff !== 0 && <span aria-hidden="true">{cheaper ? "▼" : "▲"}</span>}
                    <span className="sr-only">
                      {diff === 0
                        ? "오늘 시세와 같음, "
                        : cheaper
                          ? "오늘 시세보다 저렴, "
                          : "오늘 시세보다 비쌈, "}
                    </span>
                    {formatNumber(Math.abs(diff))}원({pct > 0 ? "+" : ""}
                    {pct.toFixed(1)}%)
                  </>
                )}
              </span>

              <span className="justify-self-end text-body-16-medium tabular-nums text-fg-neutral">
                {formatNumber(r.pricePerKg)}원{" "}
                <span className="text-body-16-regular text-fg-neutral-subtle">/{unit}</span>
              </span>
            </li>
          );
        })}
      </ul>

      {ordered.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-4 flex min-h-11 w-full items-center justify-center rounded-lg bg-bg-neutral-weak py-3.5 text-center text-body-14-medium text-fg-neutral active:bg-bg-neutral-weak-pressed"
        >
          {expanded ? "접기" : `제보 ${ordered.length}건 모두 보기`}
        </button>
      )}
    </div>
  );
}
