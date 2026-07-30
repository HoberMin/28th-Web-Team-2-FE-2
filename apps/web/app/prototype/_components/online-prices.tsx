"use client";

import { useState } from "react";
import type { OnlinePriceSet } from "../_lib/vegetables";
import { formatNumber } from "../_lib/format";

// 온라인 판매가 — **보조 기준**이라 기본은 접힌 1줄이다(기획안 §3: 온라인 비교의 메인 기능화 제외).
// 펼치면 채널별 가격 + 성격 라벨을 보여준다. 성격을 숨기고 금액만 줄 세우면
// "즉시배송이 제일 비싸다"는 당연한 결론만 반복돼 정보량이 0이 된다.
export function OnlinePrices({ set, unit }: { set: OnlinePriceSet; unit: string }) {
  const [open, setOpen] = useState(false);
  const { prices, cheapest, hasEstimated } = set;

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
            <span className="text-fg-neutral-subtle"> /{unit}</span>
          </span>
          <span className="text-caption-12-regular text-fg-neutral-subtle">
            {cheapest.mall} · {prices.length}개 채널 비교
            {hasEstimated && " · 일부 예시"}
          </span>
        </span>
        <span className="shrink-0 text-caption-12-regular text-fg-neutral-subtle">
          {open ? "접기" : "펼치기"}
        </span>
      </button>

      {open && (
        <ul className="flex flex-col gap-2">
          {prices.map((p) => (
            <li
              key={p.mall}
              className="flex items-start justify-between gap-3 rounded-xl bg-bg-neutral-weak px-4 py-3"
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="text-body-14-medium text-fg-neutral">{p.mall}</span>
                  <span className="rounded bg-bg-layer-default px-1.5 py-0.5 text-caption-12-regular text-fg-neutral-subtle">
                    {p.channel}
                  </span>
                </span>
                <span className="truncate text-caption-12-regular text-fg-neutral-subtle">
                  {p.productName}
                </span>
                {p.channelNote && (
                  <span className="text-caption-12-regular text-fg-warning">{p.channelNote}</span>
                )}
              </span>
              <span className="shrink-0 text-body-14-medium tabular-nums text-fg-neutral">
                {formatNumber(p.price)}원
              </span>
            </li>
          ))}
          <li className="text-caption-12-regular text-fg-neutral-subtle">
            채널마다 배송 조건이 달라 단순 최저가 비교로는 판단이 어려워요. 오프라인 동네 가격이 기준이고
            온라인은 참고용입니다.
          </li>
        </ul>
      )}
    </section>
  );
}
