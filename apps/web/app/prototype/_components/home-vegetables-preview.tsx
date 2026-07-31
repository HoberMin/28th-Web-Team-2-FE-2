import Link from "next/link";
import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";
import type { HomeVegetableItem } from "../_lib/home-data";
import { formatAsOfLabel, formatNumber } from "../_lib/format";
import { TrendLabel } from "./trend-label";
import { VegetableThumb } from "./vegetable-thumb";

/** 인기 품목만 훑어보는 자리라 12종(더보기 기준선)보다 적게 — 그리드가 아니라 가로 스크롤 한 줄. */
const PREVIEW_COUNT = 10;

// 홈 "야채 시세" 미리보기(2026-07-31 홈 개편 신설) — 인기 품목 가로 스크롤 + 전체보기로
// 전용 탭(F01-1, `/prototype/vegetables`)에 연결한다. 검색·필터·정렬은 여기 없다 — 찾아보는
// 행동은 전용 탭이 맡고, 홈은 훑어보는 진입만 맡는다(홈=여러 정보를 모아 액션을 유도하는
// 대시보드, 전체 조회=별도 탭이라는 역할 분리).
// items는 이미 인기순으로 정렬돼 온다(getHomeData) — 여기서 다시 고르지 않는다.
// 인터랙션 없어 서버 렌더.
export function HomeVegetablesPreview({
  items,
  priceMeta,
}: {
  items: HomeVegetableItem[];
  priceMeta: { asOf: string; isFallback: boolean };
}) {
  const preview = items.slice(0, PREVIEW_COUNT);

  return (
    <section aria-label="야채 시세" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-head2-16 text-fg-neutral">야채 시세</h2>
        <Link
          href="/prototype/vegetables"
          className="flex items-center gap-0.5 text-caption-12-regular text-fg-neutral-muted"
        >
          전체보기
          <span className="[&_svg]:size-3.5" aria-hidden="true">
            <IconChevronRightLine />
          </span>
        </Link>
      </div>

      <ul className="-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto overscroll-x-contain px-4 no-scrollbar">
        {preview.map((v) => (
          <li key={v.id} className="snap-start shrink-0">
            <Link
              href={`/prototype/price/${v.id}`}
              className="flex w-[104px] flex-col items-center gap-1 rounded-2xl bg-bg-neutral-weak px-2 py-3 active:bg-bg-neutral-weak-pressed"
            >
              <VegetableThumb image={v.image} emoji={v.emoji} size="lg" />
              <span className="line-clamp-1 text-center text-body-14-medium text-fg-neutral">{v.name}</span>
              {v.price === null ? (
                <span className="text-caption-12-regular text-fg-neutral-muted">
                  {v.seasonLabel ?? "지금은 비수기"}
                </span>
              ) : (
                <>
                  <span className="text-body-14-medium tabular-nums text-fg-neutral">
                    {formatNumber(v.price)}원
                  </span>
                  <TrendLabel trend={v.trend} />
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <span className="text-caption-12-regular tabular-nums text-fg-neutral-muted">
        {formatAsOfLabel(priceMeta.asOf)}
        {priceMeta.isFallback && " · 예시 데이터"}
      </span>
    </section>
  );
}
