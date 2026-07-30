"use client";

import Link from "next/link";
import { useFavoriteStores } from "../_lib/favorite-stores-store";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { summarizeStores, type PriceMap } from "../_lib/stores";

// 홈 "단골집 오늘 가격" — 반복 구매가 타깃의 특성이라, 매번 가게를 다시 찾지 않게 한다.
// 단골이 없으면 아무것도 그리지 않는다(빈 카드로 홈을 늘리지 않는다).
export function FavoriteStoresCard({
  priceMap,
  todayIso,
}: {
  priceMap: PriceMap;
  todayIso: string;
}) {
  const favoriteStores = useFavoriteStores();
  const { district } = useCurrentDistrict();
  const reports = useReports({ district });

  if (favoriteStores.length === 0) return null;

  const summaries = summarizeStores(reports, priceMap, todayIso).filter((s) =>
    favoriteStores.includes(s.name),
  );
  if (summaries.length === 0) return null;

  return (
    <section aria-label="단골집 오늘 가격" className="flex flex-col gap-3">
      <h2 className="text-head2-16 text-fg-neutral">단골집 오늘 가격</h2>
      <ul className="flex flex-col gap-2">
        {summaries.map((s) => (
          <li key={s.name}>
            <Link
              href={`/prototype/store/${encodeURIComponent(s.name)}`}
              className="flex items-center gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3 active:bg-bg-neutral-weak-pressed"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-body-16-semibold text-fg-neutral">{s.name}</span>
                <span className="text-caption-12-regular tabular-nums text-fg-neutral-muted">
                  {s.itemCount}개 품목 · 최근 제보 {s.freshness.label}
                </span>
              </span>
              {s.avgDiffPct !== null && (
                <span className="shrink-0 text-body-14-medium tabular-nums">
                  <span className={s.avgDiffPct < 0 ? "text-fg-positive" : "text-fg-neutral-muted"}>
                    시세 {s.avgDiffPct < 0 ? "" : "+"}
                    {s.avgDiffPct}%
                  </span>
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
