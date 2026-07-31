"use client";

// 홈 "우리 동네 오늘 최저가" — 랭킹(F06)의 최저가 품목 탭에서 옮겨왔다.
//
// 왜 홈인가: 랭킹 탭은 제보왕 단독으로 재편했고, 이 목록은 "지금 싼 것을 알린다"는 점에서
// 바로 아래 「이번 달 사기 좋은 야채」와 성격이 같다. 다만 둘은 근거가 다르다 —
// 저쪽은 1년 시세에서 뽑은 계절 저점이고, 이쪽은 **오늘 이웃이 실제로 본 가격**이다.
// 그래서 합치지 않고 나란히 둔다.
//
// 랭킹에 있을 때는 하드코딩 더미였는데, 여기서는 동네 제보를 실제로 집계한다.

import Link from "next/link";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { getVegetable } from "../_lib/vegetables";
import { getReportAge, isOutlier } from "../_lib/stores";
import { formatWon } from "../_lib/format";
import { VegetableThumb } from "./vegetable-thumb";
import type { PriceMap } from "../_lib/stores";

const LIMIT = 5;
/** 제보가 이보다 오래되면 "오늘 최저가"라고 부를 수 없다. 제보 신뢰 표시와 같은 기준(7일). */
const MAX_AGE_DAYS = 7;

interface CheapestItem {
  vegetableId: string;
  name: string;
  emoji: string;
  image?: string;
  price: number;
  place?: string;
  diffPct: number;
}

export function CheapestToday({ priceMap, todayIso }: { priceMap: PriceMap; todayIso: string }) {
  const { district, loading } = useCurrentDistrict();
  const reports = useReports({ district });

  // 위치를 아직 못 불러온 동안은 아예 그리지 않는다 — district가 기본값(삼성동)으로 잠깐
  // 고정돼 있어, 그 값으로 만든 목록이 다른 동네 사용자에게 스친다(매장 탭과 같은 잣대 —
  // 백로그 F07). 이 섹션은 빈 목록일 때도 null이라 로딩 표시 없이 사라져 있어도 어색하지 않다.
  if (loading) return null;

  // 품목마다 가장 싼 제보 1건만 남긴다 — 같은 품목이 목록을 채우면 순위가 아니라 나열이 된다.
  const best = new Map<string, CheapestItem>();
  for (const r of reports) {
    const baseline = priceMap[r.vegetableId];
    if (baseline == null || baseline <= 0) continue;
    // 오타·장난 제보가 1위로 올라오면 목록 전체를 못 믿는다.
    if (isOutlier(r.pricePerKg, baseline)) continue;
    if (getReportAge(r.createdAt, todayIso).days > MAX_AGE_DAYS) continue;

    const veg = getVegetable(r.vegetableId);
    if (!veg) continue;

    const prev = best.get(r.vegetableId);
    if (prev && prev.price <= r.pricePerKg) continue;
    best.set(r.vegetableId, {
      vegetableId: r.vegetableId,
      name: veg.name,
      emoji: veg.emoji,
      image: veg.image,
      price: r.pricePerKg,
      place: r.place,
      diffPct: Math.round(((r.pricePerKg - baseline) / baseline) * 1000) / 10,
    });
  }

  // 시세 대비 많이 싼 순 — 절대 금액이 아니라 할인폭이 "잘 산 것"의 기준이다.
  const list = [...best.values()].filter((i) => i.diffPct < 0).sort((a, b) => a.diffPct - b.diffPct);
  if (list.length === 0) return null;

  return (
    <section aria-label={`${district} 오늘 최저가`} className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-head2-16 text-fg-neutral">{district} 오늘 최저가</h2>
        <span className="text-caption-12-regular text-fg-neutral-muted">이웃 제보 기준</span>
      </div>
      <ul className="flex flex-col">
        {list.slice(0, LIMIT).map((item, i) => (
          <li key={item.vegetableId}>
            <Link
              href={`/prototype/price/${item.vegetableId}`}
              className="flex h-14 items-center gap-3 border-b border-bg-neutral-weak last:border-b-0 active:bg-bg-neutral-weak"
            >
              <span className="w-5 shrink-0 text-body-16-semibold tabular-nums text-fg-neutral-muted">
                {i + 1}
              </span>
              <VegetableThumb image={item.image} emoji={item.emoji} size="sm" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body-14-medium text-fg-neutral">{item.name}</span>
                {item.place && (
                  <span className="truncate text-caption-12-regular text-fg-neutral-muted">
                    {item.place}
                  </span>
                )}
              </span>
              <span className="flex shrink-0 flex-col items-end">
                <span className="text-body-16-semibold tabular-nums text-fg-positive">
                  {formatWon(item.price)}
                </span>
                <span className="text-caption-12-regular tabular-nums text-fg-positive">
                  시세보다 {Math.abs(item.diffPct)}% 싸요
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
