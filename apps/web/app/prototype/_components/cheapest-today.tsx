"use client";

// 홈 「우리 동네 최저가 야채」 — 이웃 제보에서 시세보다 싸게 팔린 품목을 할인폭 순으로.
//
// 이름과 기준이 2026-08-04에 정리됐다. 원래 "삼성동 오늘 최저가"였는데, 정작 집계는
// 7일치를 보고 있었다(제보가 매일 쏟아지는 서비스가 아니라 하루로 자르면 목록이 거의 빈다).
// 이름을 데이터에 맞춰 「우리 동네 최저가 야채」 + "일주일 동안 이웃이 제보한 가격"으로 바꿨다 —
// 화면의 말과 계산이 어긋나 있던 걸 계산 쪽이 아니라 말 쪽을 고쳐 맞췄다.
//
// 가격 색도 초록(fg-positive)에서 진한 그레이로 내렸다. 한 줄에 초록이 값·할인폭 두 번
// 나오면 목록 전체가 초록으로 덮여 "싼 정도"의 차이가 안 읽힌다. 초록은 할인폭 한 곳만 맡는다.

import { useState } from "react";
import Link from "next/link";
import IconStoreLine from "@karrotmarket/react-monochrome-icon/IconStoreLine";
import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { getVegetable } from "../_lib/vegetables";
import { getReportAge, isOutlier } from "../_lib/stores";
import { formatWon } from "../_lib/format";
import { VegetableThumb } from "./vegetable-thumb";
import type { PriceMap } from "../_lib/stores";

/** 기본 노출 개수. 「더보기」로 MAX_LIMIT까지 펼치고 「닫기」로 되돌린다. */
const LIMIT = 5;
const MAX_LIMIT = 10;
/** 집계 기간(일) — 섹션 캡션의 "일주일"과 같은 값이어야 한다. */
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
  const [expanded, setExpanded] = useState(false);

  // 위치를 아직 못 불러온 동안은 아예 그리지 않는다 — district가 기본값(삼성동)으로 잠깐
  // 고정돼 있어, 그 값으로 만든 목록이 다른 동네 사용자에게 스친다(가게 탭과 같은 잣대 —
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
  const sorted = [...best.values()].filter((i) => i.diffPct < 0).sort((a, b) => a.diffPct - b.diffPct);
  if (sorted.length === 0) return null;

  const list = sorted.slice(0, expanded ? MAX_LIMIT : LIMIT);
  const canShowMore = !expanded && sorted.length > LIMIT;

  return (
    <section aria-label="우리 동네 최저가 야채" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="shrink-0 text-head2-16 text-fg-neutral">우리 동네 최저가 야채</h2>
        <div className="flex min-w-0 items-center gap-1">
          <span className="truncate text-caption-12-regular text-fg-neutral-muted">
            일주일 동안 이웃이 제보한 가격
          </span>
          {/* 「전체보기」 글자 대신 화살표 하나 — 야채시세 탭(46종 전체)으로 나가는 문이다.
              펼치기(더보기)와 화면 이동은 다른 행동이라, 목록 아래(더보기)와 헤더(이동)로
              자리를 갈라 둔다. 예전엔 둘 다 이 자리에 있어서 "전체보기"가 어느 쪽인지 몰랐다. */}
          <Link
            href="/prototype/vegetables"
            aria-label="야채 시세 전체 보기"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-fg-neutral-muted active:bg-bg-neutral-weak [&_svg]:size-5"
          >
            <IconChevronRightLine />
          </Link>
        </div>
      </div>
      <ul className="flex flex-col">
        {list.map((item, i) => (
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
                  // 가게명 앞 아이콘 — 두 번째 줄이 품목 설명이 아니라 "어느 가게"인지 바로 알게 한다.
                  <span className="flex min-w-0 items-center gap-1 text-caption-12-regular text-fg-neutral-muted">
                    <span className="shrink-0 [&_svg]:size-3.5" aria-hidden="true">
                      <IconStoreLine />
                    </span>
                    <span className="truncate">{item.place}</span>
                  </span>
                )}
              </span>
              <span className="flex shrink-0 flex-col items-end">
                <span className="text-body-16-semibold tabular-nums text-fg-neutral">
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

      {/* 더보기/닫기 — 목록 끝에 둔다(펼친 뒤 되돌릴 길이 목록 위에 있으면 다시 위로 올라가야 한다) */}
      {(canShowMore || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="h-11 w-full rounded-xl bg-bg-neutral-weak text-body-14-medium text-fg-neutral active:bg-bg-neutral-weak-pressed"
        >
          {expanded ? "닫기" : "더보기"}
        </button>
      )}
    </section>
  );
}
