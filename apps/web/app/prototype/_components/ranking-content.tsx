"use client";

import { useState } from "react";
import Link from "next/link";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { LOW_PRICE_RANKING, REPORTER_RANKING } from "../_lib/ranking";
import { summarizeStores, type PriceMap } from "../_lib/stores";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { formatWon } from "../_lib/format";
import { StoreRow } from "./store-row";

type Tab = "store" | "price" | "reporter";

const TABS: { key: Tab; label: string }[] = [
  { key: "store", label: "싼 가게" },
  { key: "price", label: "최저가 품목" },
  { key: "reporter", label: "제보왕" },
];

// F06 랭킹 — 동 단위.
// "싼 가게" 탭이 첫 탭이다: 사용자의 실제 질문은 "무엇이 싼가"보다 "어디로 갈까"이고,
// 품목별 최저가만 알려주면 가게가 흩어져 발걸음이 늘어난다(노력 절약과 반대).
export function RankingContent({ priceMap, todayIso }: { priceMap: PriceMap; todayIso: string }) {
  const [tab, setTab] = useState<Tab>("store");
  const { district } = useCurrentDistrict();
  const reports = useReports({ district });
  const stores = summarizeStores(reports, priceMap, todayIso);

  return (
    <div className="flex flex-col gap-5 px-4 pt-1 pb-6">
      {/* 세그먼트 컨트롤 — 직접 만든 버튼 묶음을 seed 정품으로 교체(키보드 이동·선택 상태 전달이 기본 내장) */}
      <SegmentedControl
        aria-label="랭킹 종류"
        value={tab}
        onValueChange={(v) => setTab(v as Tab)}
      >
        {TABS.map((t) => (
          <SegmentedControlItem key={t.key} value={t.key}>
            {t.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>

      {tab === "store" && <StoreRanking stores={stores} district={district} />}

      {tab === "price" && (
        <>
          <p className="text-caption-12-regular text-fg-neutral-muted">{district} 기준 · 오늘</p>
          <ul className="flex flex-col gap-2">
            {LOW_PRICE_RANKING.map((item, i) => (
              <li key={item.vegetableId}>
                <Link
                  href={`/prototype/price/${item.vegetableId}`}
                  className="flex items-center gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3 active:bg-bg-neutral-weak-pressed"
                >
                  <span className="w-5 shrink-0 text-body-16-semibold tabular-nums text-fg-neutral-muted">
                    {i + 1}
                  </span>
                  <span className="text-[28px] leading-none" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-body-16-semibold text-fg-neutral">{item.name}</span>
                    <span className="truncate text-caption-12-regular text-fg-neutral-muted">{item.place}</span>
                  </span>
                  <span className="flex flex-col items-end">
                    <span className="text-body-14-medium tabular-nums text-fg-neutral">
                      {formatWon(item.price)}
                    </span>
                    <span className="text-caption-12-regular tabular-nums text-fg-positive">
                      시세보다 {item.discountPct}%↓
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === "reporter" && (
        <>
          <p className="text-caption-12-regular text-fg-neutral-muted">{district} 기준 · 이번 주</p>
          <ul className="flex flex-col gap-2">
            {REPORTER_RANKING.map((r) => (
              <li key={r.rank} className="flex items-center gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3">
                <span className="w-5 shrink-0 text-body-16-semibold tabular-nums text-fg-neutral-muted">
                  {r.rank}
                </span>
                <span className="min-w-0 flex-1 text-body-16-semibold text-fg-neutral">{r.nickname}</span>
                <span className="text-body-14-medium tabular-nums text-fg-neutral-muted">
                  제보 {r.reportCount}건
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * 싼 가게 순위 — 시세 대비 평균이 싼 가게 순.
 *
 * 매장 탭과 **같은 줄 컴포넌트**를 쓴다(StoreRow): 목록에서 바로 단골 등록이 되고,
 * 거리·도보 시간이 같은 자리에 나온다. 두 화면에 같은 마크업을 복붙하면 규칙이 갈린다.
 */
function StoreRanking({
  stores,
  district,
}: {
  stores: ReturnType<typeof summarizeStores>;
  district: string;
}) {
  if (stores.length === 0) {
    return (
      <p className="rounded-xl bg-bg-neutral-weak px-4 py-10 text-center text-body-14-regular text-fg-neutral-muted">
        아직 {district}에 가게별 제보가 없어요.
        <br />
        제보할 때 가게를 골라주시면 여기 순위가 생겨요.
      </p>
    );
  }

  return (
    <>
      <p className="text-caption-12-regular text-fg-neutral-muted">
        {district} 이웃 제보 기준 · 시세보다 싼 가게 순
      </p>
      <ul className="flex flex-col gap-2">
        {stores.map((s, i) => (
          <StoreRow key={s.name} store={s} rank={i + 1} />
        ))}
      </ul>
    </>
  );
}
