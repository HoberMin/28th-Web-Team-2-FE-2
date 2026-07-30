"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CARD_NEWS } from "../_lib/card-news";
import { getVegetable } from "../_lib/vegetables";

// 홈 카드뉴스 캐러셀 — F08 진입점.
// 글이 3개뿐이라 자동 롤링의 이점이 없고 정지 버튼 UI만 늘어난다(백로그 F01) → 수동 스와이프 +
// 점 인디케이터만 둔다. 인터랙션(스크롤 위치 추적)이 있어 클라 leaf.
export function CardNewsTeaser() {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.min(CARD_NEWS.length - 1, Math.max(0, index)));
  }

  return (
    <section aria-label="이번 주 시세 이야기" className="flex flex-col gap-2">
      <ul
        ref={scrollRef}
        onScroll={handleScroll}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4"
      >
        {CARD_NEWS.map((news) => {
          const veg = getVegetable(news.vegetableId);
          return (
            <li key={news.id} className="w-full shrink-0 snap-start">
              <Link
                href="/prototype/cardnews"
                className="flex items-center justify-between gap-3 rounded-2xl bg-bg-brand-weak px-4 py-3.5 active:bg-bg-brand-weak-pressed"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-caption-12-regular text-fg-neutral-muted">이번 주 시세 이야기</span>
                  <span className="truncate text-body-14-medium text-fg-neutral">
                    {veg?.emoji} {news.title}
                  </span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-body-14-medium text-fg-neutral-muted">
                  더보기
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* 점 인디케이터 — 현재 카드 위치만 알려주는 장식 요소라 aria-hidden */}
      <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
        {CARD_NEWS.map((news, i) => (
          <span
            key={news.id}
            className={`size-1.5 rounded-full ${i === active ? "bg-bg-brand-solid" : "bg-bg-neutral-weak-pressed"}`}
          />
        ))}
      </div>
    </section>
  );
}
