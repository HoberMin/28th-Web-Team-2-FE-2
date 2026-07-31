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

  // 스크롤바를 감췄으므로 "더 있다"를 알려주는 건 이 점 인디케이터뿐이다 → 위치가 정확해야 한다.
  // clientWidth로 나누면 좌우 패딩과 카드 사이 간격이 빠져 뒤 카드로 갈수록 인덱스가 밀린다.
  // 실제 카드 폭 + 간격으로 나눈다.
  function handleScroll() {
    const el = scrollRef.current;
    const card = el?.firstElementChild;
    if (!el || !card) return;
    const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = card.clientWidth + gap;
    const index = step > 0 ? Math.round(el.scrollLeft / step) : 0;
    setActive(Math.min(CARD_NEWS.length - 1, Math.max(0, index)));
  }

  return (
    <section aria-label="이번 주 시세 이야기" className="flex flex-col gap-2">
      <ul
        ref={scrollRef}
        onScroll={handleScroll}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 no-scrollbar"
      >
        {CARD_NEWS.map((news) => {
          const veg = getVegetable(news.vegetableId);
          return (
            <li key={news.id} className="w-full shrink-0 snap-start">
              {/* 앵커로 눌린 글 위치를 넘긴다 — 예전엔 3장 전부 목록 맨 위로 가 스와이프한
                  맥락(3번째 카드를 눌러도 1번 글부터 보임)이 버려졌다(백로그 F08). */}
              <Link
                href={`/prototype/cardnews#${news.id}`}
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
