"use client";

import Link from "next/link";
import IconBookmarkFill from "@karrotmarket/react-monochrome-icon/IconBookmarkFill";
import IconBookmarkLine from "@karrotmarket/react-monochrome-icon/IconBookmarkLine";
import { toggleFavoriteStore, useIsFavoriteStore } from "../_lib/favorite-stores-store";
import { useCurrentCoords } from "../_lib/location";
import { distanceMeters, getStoreLocation, walkMinutes } from "../_lib/store-locations";
import type { StoreSummary } from "../_lib/stores";
import { formatDiff, getDiffColorToken } from "../_lib/format";
import { FreshnessTag } from "./freshness-tag";

// 매장 목록의 한 줄 — 매장 탭과 랭킹(싼 가게)이 같은 줄을 쓴다.
//
// 한 줄에 세 가지를 같이 담는다: 얼마나 싼가(시세 대비 평균) · 얼마나 먼가(거리·도보) ·
// 근거가 얼마나 두꺼운가(품목 수·최신도). 싼 것만 보여주면 발걸음이 늘어 절약이 상쇄된다.
//
// 단골 토글은 링크 위에 겹치지 않고 옆에 둔다 — 목록에서 바로 등록할 수 있어야
// "여기 자주 가는 데야"를 화면 이동 없이 남긴다.
export function StoreRow({ store, rank }: { store: StoreSummary; rank?: number }) {
  const isFavorite = useIsFavoriteStore(store.name);
  const coords = useCurrentCoords();
  const location = getStoreLocation(store.name, store.district);
  const meters = distanceMeters(coords, location);

  return (
    <li className="relative flex items-center rounded-2xl bg-bg-neutral-weak">
      <Link
        href={`/prototype/store/${encodeURIComponent(store.name)}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl py-3 pl-4 pr-14 active:bg-bg-neutral-weak-pressed"
      >
        {rank !== undefined && (
          <span className="w-5 shrink-0 text-body-16-semibold tabular-nums text-fg-neutral-muted">
            {rank}
          </span>
        )}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-body-16-semibold text-fg-neutral">{store.name}</span>
          <span className="flex items-center gap-1.5">
            {/* 거리와 도보 시간은 같은 사실의 두 표현이고, 좌표가 이름 해시로 만든 값이라
                정밀도도 없다 — 행동으로 바로 이어지는 도보 시간 하나만 남긴다(백로그 F07). */}
            <span className="shrink-0 text-caption-12-regular tabular-nums text-fg-neutral-muted">
              걸어서 {walkMinutes(meters)}분
            </span>
            <FreshnessTag freshness={store.freshness} />
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end">
          {/* 순위 목록의 정렬 기준값 — 이름과 같거나 더 크게(백로그 F07 위계 역전 수정) */}
          {store.avgDiffPct !== null && (
            <span
              aria-label={formatDiff(store.avgDiffPct)}
              className={`text-body-16-semibold tabular-nums ${getDiffColorToken(store.avgDiffPct)}`}
            >
              시세 {store.avgDiffPct > 0 ? "+" : ""}
              {store.avgDiffPct}%
            </span>
          )}
          {/* 근거 두께 신호 — 제보 1건짜리 가게가 20건짜리와 같은 무게로 보이지 않게
              교차검증 품목 수를, 없으면 제보 건수를 보여준다(백로그 F07). */}
          <span className="text-caption-12-regular tabular-nums text-fg-neutral-muted">
            {store.crossCheckedItemCount > 0
              ? `이웃 확인 ${store.crossCheckedItemCount}개 품목`
              : `제보 ${store.reportCount}건`}
          </span>
        </span>
      </Link>
      {/* 아이콘만 있는 버튼 → aria-label이 상태까지 말한다(북마크 모양만으로는 켜짐/꺼짐이 안 읽힌다) */}
      <button
        type="button"
        onClick={() => toggleFavoriteStore(store.name)}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? `${store.name} 단골 해제` : `${store.name} 단골로 등록`}
        className={`absolute right-1 flex size-11 items-center justify-center rounded-full [&_svg]:size-5 ${
          isFavorite ? "text-fg-brand-contrast" : "text-fg-neutral-muted"
        }`}
      >
        {isFavorite ? <IconBookmarkFill /> : <IconBookmarkLine />}
      </button>
    </li>
  );
}
