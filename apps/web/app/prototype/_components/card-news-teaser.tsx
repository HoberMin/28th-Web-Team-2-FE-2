import Link from "next/link";
import { CARD_NEWS } from "../_lib/card-news";
import { getVegetable } from "../_lib/vegetables";

// 홈 카드뉴스 티저 — F08 진입점. 콘텐츠는 예시/더미(자동 요약 없음).
export function CardNewsTeaser() {
  const top = CARD_NEWS[0];
  const veg = getVegetable(top.vegetableId);

  return (
    <Link
      href="/prototype/cardnews"
      className="flex items-center justify-between gap-3 rounded-2xl bg-bg-brand-weak px-4 py-3.5 active:bg-bg-brand-weak-pressed"
    >
      <span className="flex min-w-0 flex-col">
        <span className="text-caption-12-regular text-fg-neutral-muted">예시 · 이번 주 시세 이야기</span>
        <span className="truncate text-body-14-medium text-fg-neutral">
          {veg?.emoji} {top.title}
        </span>
      </span>
      <span aria-hidden="true" className="shrink-0 text-body-14-medium text-fg-neutral-muted">
        더보기
      </span>
    </Link>
  );
}
