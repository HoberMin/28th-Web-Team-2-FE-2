"use client";

import Link from "next/link";
import IconStoreLine from "@karrotmarket/react-monochrome-icon/IconStoreLine";
import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";
import { useFavoriteStores } from "../_lib/favorite-stores-store";

// 홈 「찜한 가게」 — 반복 구매가 타깃의 특성이라, 매번 가게를 다시 찾지 않게 한다.
// 찜한 가게가 없으면 아무것도 그리지 않는다(빈 카드로 홈을 늘리지 않는다).
//
// 2026-08-04 정리: 이름이 "단골집 오늘 가격"이었고 줄마다 시세 평균(%)·품목 개수·최근 제보
// 날짜를 달고 있었다. 셋 다 뺐다 — 홈에서 하려는 일은 "그 가게로 다시 들어가기" 하나이고,
// 숫자 셋은 그 결정에 쓰이지 않으면서 줄을 복잡하게 만들었다(비교는 가게 상세에서 한다).
// 그래서 이 카드는 시세(priceMap)를 더 이상 받지 않는다 — 제보를 집계할 일이 없다.
//
// 최대 3개만 노출한다. 그 이상은 「찜」 탭이 전부 갖고 있다.
const LIMIT = 3;

export function FavoriteStoresCard() {
  const favoriteStores = useFavoriteStores();

  if (favoriteStores.length === 0) return null;

  const visible = favoriteStores.slice(0, LIMIT);

  return (
    <section aria-label="찜한 가게" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-head2-16 text-fg-neutral">찜한 가게</h2>
        {favoriteStores.length > LIMIT && (
          <Link
            href="/prototype/favorites"
            className="text-caption-12-regular text-fg-neutral-muted underline"
          >
            {favoriteStores.length}곳 전체
          </Link>
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {visible.map((name) => (
          <li key={name}>
            <Link
              href={`/prototype/store/${encodeURIComponent(name)}`}
              className="flex items-center gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3 active:bg-bg-neutral-weak-pressed"
            >
              <span className="shrink-0 text-fg-neutral-muted [&_svg]:size-5" aria-hidden="true">
                <IconStoreLine />
              </span>
              <span className="min-w-0 flex-1 truncate text-body-16-semibold text-fg-neutral">
                {name}
              </span>
              <span className="shrink-0 text-fg-neutral-muted [&_svg]:size-4" aria-hidden="true">
                <IconChevronRightLine />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
