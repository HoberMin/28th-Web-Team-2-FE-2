import Image from "next/image";
import Link from "next/link";
import type { SeasonalPick } from "../_lib/trend";
import { formatNumber } from "../_lib/format";

// 홈 "이번 달 사기 좋은 야채" — 연 월평균 시리즈에서 지금 달이 저점권인 품목만.
// 식물학적 제철이 아니라 실시세 계산값이라, 근거를 라벨로 밝힌다(월별 최저가 시기와 같은 기준).
// 인터랙션 없어 서버 렌더.
export function SeasonalPicks({ picks, month }: { picks: SeasonalPick[]; month: number }) {
  if (picks.length === 0) return null;

  return (
    <section aria-label={`${month}월에 사기 좋은 야채`} className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-head2-16 text-fg-neutral">{month}월에 사기 좋은 야채</h2>
        <span className="text-caption-12-regular text-fg-neutral-muted">1년 시세 기준</span>
      </div>

      {/* 가로 스크롤 — 목록이 길어져도 홈 세로 길이를 늘리지 않는다 */}
      <ul className="-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto overscroll-x-contain px-4 no-scrollbar">
        {picks.map((p) => (
          <li key={p.vegetableId} className="snap-start shrink-0">
            <Link
              href={`/prototype/price/${p.vegetableId}`}
              className="flex w-[112px] flex-col items-center gap-1 rounded-2xl bg-bg-brand-weak px-3 py-3 active:bg-bg-brand-weak-pressed"
            >
              <span className="flex h-11 items-center justify-center">
                {p.image ? (
                  <Image src={p.image} alt="" width={40} height={44} className="h-11 w-auto object-contain" />
                ) : (
                  <span className="text-[30px] leading-none" aria-hidden="true">
                    {p.emoji}
                  </span>
                )}
              </span>
              <span className="text-body-14-medium text-fg-neutral">{p.name}</span>
              <span className="text-caption-12-regular tabular-nums text-fg-neutral-muted">
                {formatNumber(p.price)}원
              </span>
              <span className="text-caption-12-regular tabular-nums text-fg-neutral">
                연 최고가보다 {p.discountPct}%↓
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
