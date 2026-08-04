"use client";

import { useState } from "react";
import Link from "next/link";
import IconLocationpinFill from "@karrotmarket/react-monochrome-icon/IconLocationpinFill";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { useNearbyDistrictReports, useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { formatDateDot, formatNumber } from "../_lib/format";
import { countCrossChecks, getReportAge, isOutlier } from "../_lib/stores";
import type { Report } from "../_lib/types";

// 제보 카드 — 윗줄 가게명+가격 / 아랫줄 제보 시점·교차검증 + 시세 대비 차이 (Figma F03 node 84:2377 재정리).
// 이전엔 3열 그리드에 정보 6개를 넣어 첫 열에만 4단이 쌓이고, 비교 대상인 가게명이 날짜 밑 부속처럼 보였다.
const PREVIEW_COUNT = 3;

type SortMode = "cheap" | "latest";

/** 현재 동 배지 (동네 제보가 헤더). */
export function DistrictBadge() {
  const { district } = useCurrentDistrict();
  return (
    <span className="flex items-center gap-0.5 text-body-14-regular text-content-primary">
      <span className="[&_svg]:size-4" aria-hidden="true">
        <IconLocationpinFill />
      </span>
      {district}
    </span>
  );
}

/**
 * 헤더의 "동네 제보가" — 이 화면의 주인공 값(가장 크게).
 * 우리 동네 제보가 없으면 근처 동네 값 + 출처 꼬리표로 대체한다(표와 같은 콜드스타트 대응 —
 * 표만 근처 동네로 바뀌고 헤더가 "아직 없어요"로 남으면 같은 화면 안에서 모순으로 읽힌다).
 */
export function LatestReportPrice({ vegetableId }: { vegetableId: string }) {
  const { district } = useCurrentDistrict();
  const reports = useReports({ vegetableId, district });
  const nearbyGroups = useNearbyDistrictReports(vegetableId, district);
  const latest = reports[0];

  if (!latest) {
    const nearby = nearbyGroups[0];
    const nearbyLatest = nearby?.reports[0];
    if (nearbyLatest) {
      return (
        <span className="flex flex-col items-end">
          <span className="text-title-20-medium tabular-nums text-content-primary">
            {formatNumber(nearbyLatest.pricePerKg)}원
          </span>
          <span className="text-caption-12-regular text-content-secondary">{nearby.district} 제보 기준</span>
        </span>
      );
    }
    return <span className="text-body-14-medium text-content-secondary">아직 없어요</span>;
  }

  return <span className="text-title-20-medium tabular-nums text-content-primary">{formatNumber(latest.pricePerKg)}원</span>;
}

/**
 * 동네 제보가 리스트 (크라우드소싱 결과, 현재 동 기준).
 * basePrice = 오늘 시세 — 제보한 실제가와의 플마 차이를 카드에 표시(핵심 가치: 눈으로 보는 변화).
 *
 * 신뢰 장치 3개가 여기 붙는다:
 *   제보 시점 — 야채 가격은 주 단위로 움직여 1주일 넘은 제보는 흐리게 + 경고
 *   교차검증 — 같은 가게·같은 품목 제보가 2건 이상이면 "이웃 N명 확인"
 *   이상치  — 시세의 3배/⅓ 밖 제보는 목록 맨 아래로 내리고 "확인 필요"로 표시(삭제하지 않는다).
 *            색은 쓰지 않는다(흐림 + 뱃지) — 초록(쌈)/빨강(비쌈)만 남기고 색을 2종으로 줄인다.
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
  // 판단에 필요한 건 대개 "어디가 제일 싼가" → 기본은 싼 순.
  const [sort, setSort] = useState<SortMode>("cheap");

  // 우리 동네 제보가 0건이면 **근처 동네**를 보여준다(콜드스타트).
  // 빈 화면만 보여주면 "쓸 데이터가 없는 앱"으로 판단하고 떠난다. 정확도는 낮지만 어느 동네
  // 값인지 밝히면 오해가 없고, 아무것도 없는 것보다 낫다.
  if (all.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-xl bg-gray-100 px-4 py-6 text-center text-body-14-regular text-content-secondary">
          아직 {district} 제보가 없어요.
          <br />
          첫 실제가를 제보해 주시면 이웃이 헛걸음하지 않아요.
        </p>

        {nearbyGroups.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-caption-12-regular text-content-secondary">
              대신 근처 동네 가격을 참고하세요
            </p>
            <ul className="flex flex-col gap-2">
              {nearbyGroups.map((group) => {
                const latest = group.reports[0];
                const diff = basePrice - latest.pricePerKg;
                return (
                  <li
                    key={group.district}
                    className="flex items-center justify-between gap-2 rounded-xl bg-gray-100 px-4 py-3"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="text-body-14-medium text-content-primary">{group.district}</span>
                      <span className="text-caption-12-regular text-content-secondary">
                        {getReportAge(latest.createdAt, todayIso).label} · 제보 {group.reports.length}건
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end">
                      <span className="text-body-14-medium tabular-nums text-content-primary">
                        {formatNumber(latest.pricePerKg)}원
                        <span className="text-content-secondary"> /{unit}</span>
                      </span>
                      <span
                        className={`text-caption-12-regular tabular-nums ${
                          diff > 0 ? "text-green-600" : "text-content-secondary"
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

  // 이상치는 지우지 않고 맨 아래로 — 판단을 흐리지 않으면서 기록은 남긴다. 정렬은 이상치를 뺀
  // 목록에만 적용한다(이상치는 어느 정렬에서든 맨 아래 고정).
  const normal: Report[] = [];
  const outliers: Report[] = [];
  for (const r of all) {
    if (isOutlier(r.pricePerKg, basePrice)) outliers.push(r);
    else normal.push(r);
  }
  const sorted =
    sort === "cheap"
      ? [...normal].sort((a, b) => a.pricePerKg - b.pricePerKg)
      : [...normal].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const ordered = [...sorted, ...outliers];
  const visible = expanded ? ordered : ordered.slice(0, PREVIEW_COUNT);

  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl
        aria-label="정렬"
        value={sort}
        onValueChange={(v) => setSort(v as SortMode)}
      >
        <SegmentedControlItem value="cheap">싼 순</SegmentedControlItem>
        <SegmentedControlItem value="latest">최신순</SegmentedControlItem>
      </SegmentedControl>

      <ul className="flex flex-col gap-2">
        {visible.map((r) => {
          // diff>0 = 제보가가 시세보다 쌈(초록). 퍼센트 부호는 Figma 규격(쌈=음수, 비쌈=양수).
          const diff = basePrice - r.pricePerKg;
          const cheaper = diff > 0;
          const pct = basePrice > 0 ? ((r.pricePerKg - basePrice) / basePrice) * 100 : 0;
          const reportAge = getReportAge(r.createdAt, todayIso);
          const crossChecks = r.place ? countCrossChecks(districtReports, r.place, vegetableId) : 0;
          const outlier = isOutlier(r.pricePerKg, basePrice);
          const dateLabel = formatDateDot(r.createdAt.slice(0, 10));

          return (
            <li
              key={r.id}
              className={`flex flex-col gap-1.5 rounded-2xl bg-gray-100 px-4 py-3 ${
                outlier ? "opacity-60" : ""
              }`}
            >
              {/* 윗줄 — 가게명 + 가격 */}
              <div className="flex items-center justify-between gap-2">
                {r.place ? (
                  <Link
                    href={`/prototype/store/${encodeURIComponent(r.place)}`}
                    className="min-w-0 truncate text-body-16-semibold text-content-primary underline decoration-dotted"
                  >
                    {r.place}
                  </Link>
                ) : (
                  <span className="text-body-16-semibold text-content-secondary">가게 미기재</span>
                )}
                <span className="shrink-0 text-body-16-semibold tabular-nums text-content-primary">
                  {formatNumber(r.pricePerKg)}원
                  <span className="text-body-14-regular text-content-secondary"> /{unit}</span>
                </span>
              </div>

              {/* 아랫줄 — 제보 시점·교차검증 + 시세 대비 차이(가격과 같은 급으로) */}
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 flex-wrap items-center gap-1 text-caption-12-regular text-content-secondary">
                  <time dateTime={r.createdAt.slice(0, 10)} aria-label={`${dateLabel} 제보`}>
                    {reportAge.label}
                  </time>
                  {/* 「· 오래됨」 캡션은 2026-08-04에 뺐다 — 며칠부터 오래된 건지는 품목마다
                      사람마다 달라(감자 5일 전 vs 상추 5일 전) 기준을 우리가 정할 근거가 없었다.
                      날짜(reportAge.label)는 그대로 있으니 판단은 보는 사람이 한다. */}
                  {crossChecks >= 2 && (
                    <span className="rounded bg-green-50 px-1 py-0.5 text-green-600">
                      {crossChecks}명 확인
                    </span>
                  )}
                </span>

                {outlier ? (
                  <span className="shrink-0 rounded bg-surface-primary px-1.5 py-0.5 text-caption-12-regular text-content-secondary">
                    확인 필요
                  </span>
                ) : (
                  <span
                    className={`flex shrink-0 items-center gap-0.5 text-body-14-medium tabular-nums ${
                      diff === 0 ? "text-content-secondary" : cheaper ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {diff !== 0 && <span aria-hidden="true">{cheaper ? "▼" : "▲"}</span>}
                    <span className="sr-only">
                      {diff === 0 ? "오늘 시세와 같음, " : cheaper ? "오늘 시세보다 저렴, " : "오늘 시세보다 비쌈, "}
                    </span>
                    시세 대비 {formatNumber(Math.abs(diff))}원({pct > 0 ? "+" : ""}
                    {pct.toFixed(1)}%)
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {ordered.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-1 flex min-h-11 w-full items-center justify-center rounded-lg bg-gray-100 py-3.5 text-center text-body-14-medium text-content-primary active:bg-gray-200"
        >
          {expanded ? "접기" : `제보 ${ordered.length}건 모두 보기`}
        </button>
      )}
    </div>
  );
}
