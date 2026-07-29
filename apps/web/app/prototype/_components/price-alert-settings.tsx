"use client";

import Image from "next/image";
import { getVegetable } from "../_lib/vegetables";
import { togglePriceAlert, usePriceAlerts } from "../_lib/price-alerts-store";

// 가격 알림 설정 — 찜한 야채마다 켜고 끄는 토글. 실제 발송은 없음(프로토타입, 예시 UI).
export function PriceAlertSettings({ favorites }: { favorites: string[] }) {
  const alerts = usePriceAlerts();

  if (favorites.length === 0) {
    return (
      <section aria-label="가격 알림 설정" className="flex flex-col gap-3">
        <h2 className="text-body-16-semibold text-fg-neutral">가격 알림</h2>
        <p className="rounded-xl bg-bg-neutral-weak px-4 py-6 text-center text-body-14-regular text-fg-neutral-subtle">
          찜한 야채가 있으면 가격이 떨어질 때 알려드려요.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="가격 알림 설정" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-body-16-semibold text-fg-neutral">가격 알림</h2>
        <span className="text-caption-12-regular text-fg-neutral-subtle">예시 기능 · 실제 발송 없음</span>
      </div>
      <ul className="flex flex-col gap-2">
        {favorites.map((id) => {
          const veg = getVegetable(id);
          if (!veg) return null;
          const enabled = alerts.includes(id);
          return (
            <li
              key={id}
              className="flex items-center gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3"
            >
              <Image src={veg.image} alt="" width={36} height={36} className="size-9 shrink-0 object-contain" />
              <span className="min-w-0 flex-1 text-body-14-medium text-fg-neutral">{veg.name} 시세 알림</span>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={`${veg.name} 가격 알림 ${enabled ? "끄기" : "켜기"}`}
                onClick={() => togglePriceAlert(id)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  enabled ? "bg-bg-brand" : "bg-bg-neutral-weak-pressed"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-bg-layer-default transition-transform ${
                    enabled ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
