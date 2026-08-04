"use client";

// 홈 「이 가게 어때요?」 — 내 근처 저렴한 야채가 많은 가게 하나를 골라 보여준다.
//
// 사용자가 여기서 얻는 것: "오늘 어디로 갈까"에 대한 답 한 개. 가게 목록(동네 가게 탭)은
// 고르는 일을 사용자에게 넘기지만, 홈에서는 이미 고른 결과를 준다.
//
// 고르는 규칙(기획 확정): **현 위치에서 가까운 가게 3개** 중 **공공 시세보다 저렴한 품목이
// 가장 많은 1개**. 가까운 순으로 먼저 자르는 게 핵심이다 — 아무리 싸도 멀면 안 가기 때문에,
// "싼 집 1위"가 아니라 "갈 만한 거리 안에서 가장 싼 집"을 answer로 둔다.
//
// 저렴한 품목은 숫자가 아니라 일러스트로 보여준다 — "무엇이 싼가"가 개수보다 먼저 읽힌다.

import Link from "next/link";
import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";
import { useCurrentCoords, useCurrentDistrict } from "../_lib/location";
import { useReports } from "../_lib/reports-store";
import { getStoreItems, summarizeStores, type PriceMap } from "../_lib/stores";
import { distanceMeters, formatDistance, getStoreLocation } from "../_lib/store-locations";
import { VegetableThumb } from "./vegetable-thumb";

/** 후보로 두는 "가까운 가게" 수 — 이 안에서만 싼 집을 고른다. */
const NEARBY_CANDIDATES = 3;
/** 카드에 그리는 저렴한 품목 일러스트 최대 개수(나머지는 「+N」). */
const THUMB_LIMIT = 4;

export function NearbyCheapStore({
  priceMap,
  todayIso,
}: {
  priceMap: PriceMap;
  todayIso: string;
}) {
  const { district } = useCurrentDistrict();
  const coords = useCurrentCoords();
  const reports = useReports({ district });

  const summaries = summarizeStores(reports, priceMap, todayIso);
  if (summaries.length === 0) return null;

  // 1) 가까운 순 3개로 후보를 좁힌다.
  const nearby = summaries
    .map((summary) => ({
      summary,
      meters: distanceMeters(coords, getStoreLocation(summary.name, summary.district)),
    }))
    .sort((a, b) => a.meters - b.meters)
    .slice(0, NEARBY_CANDIDATES);

  // 2) 그중 시세보다 싼 품목이 가장 많은 한 곳. 같으면 더 가까운 쪽(정렬이 이미 가까운 순).
  const winner = nearby.reduce((best, candidate) =>
    candidate.summary.cheaperCount > best.summary.cheaperCount ? candidate : best,
  );

  // 싼 품목이 하나도 없으면 이 섹션이 할 말이 없다 — 카드를 그리지 않는다(빈 카드로 홈을 늘리지 않는다).
  if (winner.summary.cheaperCount === 0) return null;

  const cheaperItems = getStoreItems(reports, winner.summary.name, priceMap, todayIso)
    .filter((item) => !item.outlier && item.diffPct !== null && item.diffPct < 0)
    .sort((a, b) => (a.diffPct ?? 0) - (b.diffPct ?? 0));

  return (
    <section aria-label="이 가게 어때요?" className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-head2-16 text-fg-neutral">이 가게 어때요?</h2>
        <p className="text-caption-12-regular text-fg-neutral-muted">
          내 근처 저렴한 야채가 많은 가게를 선정했어요
        </p>
      </div>

      <Link
        href={`/prototype/store/${encodeURIComponent(winner.summary.name)}`}
        className="flex flex-col gap-3 rounded-2xl bg-bg-brand-weak px-4 py-4 active:bg-bg-brand-weak-pressed"
      >
        <span className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-body-16-semibold text-fg-neutral">
            {winner.summary.name}
          </span>
          <span className="shrink-0 text-caption-12-regular tabular-nums text-fg-neutral-muted">
            {formatDistance(winner.meters)}
          </span>
          <span className="shrink-0 text-fg-neutral-muted [&_svg]:size-4" aria-hidden="true">
            <IconChevronRightLine />
          </span>
        </span>

        <span className="flex flex-col gap-1.5">
          <span className="text-caption-12-regular text-fg-neutral-muted">
            공공 시세보다 저렴한 야채 {cheaperItems.length}가지
          </span>
          <span className="flex items-center gap-1.5">
            {cheaperItems.slice(0, THUMB_LIMIT).map((item) => (
              <span key={item.vegetableId} className="flex flex-col items-center gap-0.5">
                <VegetableThumb image={item.image} emoji={item.emoji} size="md" />
                <span className="text-caption-12-regular text-fg-neutral">{item.name}</span>
              </span>
            ))}
            {cheaperItems.length > THUMB_LIMIT && (
              <span className="self-center text-caption-12-regular tabular-nums text-fg-neutral-muted">
                +{cheaperItems.length - THUMB_LIMIT}
              </span>
            )}
          </span>
        </span>
      </Link>
    </section>
  );
}
