"use client";

// 지도 핀을 눌렀을 때 뜨는 가게 요약(바텀시트 본문) — 가게 상세(F09)의 압축판이다.
//
// 시트에 담는 건 "지금 갈까"를 정하는 데 필요한 최소값 셋 + 최근 제보 미리보기다: 얼마나 먼가 ·
// 시세보다 싼가 · 싼 품목이 몇 개인가 · 최근 뭐가 얼마에 올라왔나. 전체 품목 목록·댓글은 상세로
// 넘긴다 — 시트가 화면을 반 넘게 덮으면 지도를 띄운 이유가 없어진다.

import Link from "next/link";
import { ActionButton } from "seed-design/ui/action-button";
import IconHeartFill from "@karrotmarket/react-monochrome-icon/IconHeartFill";
import IconHeartLine from "@karrotmarket/react-monochrome-icon/IconHeartLine";
import { toggleFavoriteStore, useIsFavoriteStore } from "../_lib/favorite-stores-store";
import { formatDistance, walkMinutes } from "../_lib/store-locations";
import { formatNumber } from "../_lib/format";
import type { StoreItemPrice, StoreSummary } from "../_lib/stores";
import { VegetableThumb } from "./vegetable-thumb";
import { FreshnessTag } from "./freshness-tag";

export function StoreSheetBody({
  store,
  meters,
  recentItems,
}: {
  store: StoreSummary;
  /** 내 위치에서의 거리(m) — 좌표 계산은 호출부(지도)가 이미 했으니 다시 하지 않는다. */
  meters: number;
  /** 최근 제보 미리보기(최대 3건, 제보 시점 최신순) — 호출부(지도)가 이미 정렬해 넘긴다. */
  recentItems: StoreItemPrice[];
}) {
  const isFavorite = useIsFavoriteStore(store.name);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-body-14-regular tabular-nums text-content-secondary">
          내 위치에서 {formatDistance(meters)} · 걸어서 {walkMinutes(meters)}분
        </p>
        <p className="text-body-14-regular text-content-primary">
          {store.avgDiffPct === null ? (
            <span className="text-content-secondary">아직 시세와 비교할 제보가 부족해요</span>
          ) : store.avgDiffPct < 0 ? (
            <>
              시세보다 평균{" "}
              <span className="tabular-nums text-green-600">
                {Math.abs(store.avgDiffPct)}% 저렴
              </span>
            </>
          ) : (
            <>
              시세보다 평균{" "}
              <span className="tabular-nums text-content-secondary">{store.avgDiffPct}% 비쌈</span>
            </>
          )}
        </p>
        <p className="text-caption-12-regular tabular-nums text-content-secondary">
          저렴한 야채 {store.cheaperCount}가지 · 제보된 품목 {store.itemCount}개 ·{" "}
          {store.freshness.label} 제보
        </p>
      </div>

      {recentItems.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-caption-12-medium text-content-secondary">최근 제보</h3>
          <ul className="flex flex-col gap-2">
            {recentItems.map((item) => (
              <li key={item.vegetableId} className="flex items-center gap-2">
                <VegetableThumb image={item.image} emoji={item.emoji} size="sm" />
                <span className="min-w-0 flex-1 truncate text-body-14-medium text-content-primary">
                  {item.name}
                </span>
                <span className="shrink-0 text-body-14-medium tabular-nums text-content-primary">
                  {formatNumber(item.price)}원
                </span>
                <FreshnessTag freshness={item.freshness} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex items-center gap-2">
        <ActionButton asChild variant="neutralSolid" size="medium" className="flex-1">
          <Link href={`/prototype/store/${encodeURIComponent(store.name)}`}>가게 상세 보기</Link>
        </ActionButton>
        {/* 찜은 시트에서 바로 — 지도를 보다가 "여기 담아둘래"가 화면 이동 없이 끝나야 한다 */}
        <button
          type="button"
          onClick={() => toggleFavoriteStore(store.name)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `${store.name} 찜 해제` : `${store.name} 찜하기`}
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl border border-border-primary active:bg-gray-100 [&_svg]:size-5 ${
            isFavorite ? "text-red-600" : "text-content-secondary"
          }`}
        >
          {isFavorite ? <IconHeartFill /> : <IconHeartLine />}
        </button>
      </div>
    </div>
  );
}
