"use client";

import { useState } from "react";
import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";
import type { OnlinePriceSet } from "../_lib/vegetables";
import { formatNumber } from "../_lib/format";

/**
 * 채널별 검색 링크 — 항목을 눌렀을 때 실제로 그 몰에서 찾아볼 수 있게 한다.
 * 상품 단위 딥링크는 SKU가 계속 바뀌어 죽은 링크가 되므로 **품목 검색**으로 보낸다.
 * B마트는 웹 검색이 없어(앱 전용) 배민 홈으로 보낸다.
 */
const MALL_SEARCH: Record<string, (term: string) => string> = {
  컬리: (t) => `https://www.kurly.com/search?sword=${encodeURIComponent(t)}`,
  쿠팡: (t) => `https://www.coupang.com/np/search?q=${encodeURIComponent(t)}`,
  G마켓: (t) => `https://browse.gmarket.co.kr/search?keyword=${encodeURIComponent(t)}`,
  B마트: () => "https://www.baemin.com",
};

/** 목록에 없는 몰이 생겨도 링크가 죽지 않게 — 검색으로 폴백. */
function mallSearchUrl(mall: string, term: string): string {
  const build = MALL_SEARCH[mall];
  if (build) return build(term);
  return `https://search.naver.com/search.naver?query=${encodeURIComponent(term)}`;
}

// 온라인 판매가 — **보조 기준**이라 기본은 접힌 1줄이다(기획안 §3: 온라인 비교의 메인 기능화 제외).
// 펼치면 채널별 가격 + 성격 라벨을 보여준다. 성격을 숨기고 금액만 줄 세우면
// "즉시배송이 제일 비싸다"는 당연한 결론만 반복돼 정보량이 0이 된다.
export function OnlinePrices({
  set,
  unit,
  vegetableName,
}: {
  set: OnlinePriceSet;
  unit: string;
  vegetableName: string;
}) {
  const [open, setOpen] = useState(false);
  const { prices, cheapest } = set;

  return (
    <section aria-label="온라인 판매가" className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-11 items-center justify-between gap-2 rounded-xl bg-bg-neutral-weak px-4 py-3 text-left active:bg-bg-neutral-weak-pressed"
      >
        <span className="flex min-w-0 flex-col">
          <span className="text-body-14-medium text-fg-neutral">
            온라인 최저 {formatNumber(cheapest.price)}원
            <span className="text-fg-neutral-muted"> /{unit}</span>
          </span>
          <span className="text-caption-12-regular text-fg-neutral-muted">
            {cheapest.mall} · {prices.length}개 채널 비교
          </span>
        </span>
        <span className="shrink-0 text-caption-12-regular text-fg-neutral-muted">
          {open ? "접기" : "펼치기"}
        </span>
      </button>

      {open && (
        <ul className="flex flex-col gap-2">
          {prices.map((p) => (
            <li key={p.mall}>
              {/* 외부 몰로 나가는 링크 — 새 탭으로 열어 보던 시세 화면을 잃지 않게 한다 */}
              <a
                href={mallSearchUrl(p.mall, vegetableName)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-3 rounded-xl bg-bg-neutral-weak px-4 py-3 active:bg-bg-neutral-weak-pressed"
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="text-body-14-medium text-fg-neutral">{p.mall}</span>
                    <span className="rounded bg-bg-layer-default px-1.5 py-0.5 text-caption-12-regular text-fg-neutral-muted">
                      {p.channel}
                    </span>
                  </span>
                  <span className="truncate text-caption-12-regular text-fg-neutral-muted">
                    {p.productName}
                  </span>
                  {p.channelNote && (
                    <span className="text-caption-12-regular text-fg-warning">{p.channelNote}</span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <span className="text-body-14-medium tabular-nums text-fg-neutral">
                    {formatNumber(p.price)}원
                  </span>
                  <IconChevronRightLine className="size-4 text-fg-neutral-muted" aria-hidden="true" />
                </span>
              </a>
            </li>
          ))}
          <li className="text-caption-12-regular text-fg-neutral-muted">
            채널마다 배송 조건이 달라 단순 최저가 비교로는 판단이 어려워요. 오프라인 동네 가격이 기준이고
            온라인은 참고용입니다.
          </li>
        </ul>
      )}
    </section>
  );
}
