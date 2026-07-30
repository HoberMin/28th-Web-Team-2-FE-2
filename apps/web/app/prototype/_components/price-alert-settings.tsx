"use client";

import { Switch } from "seed-design/ui/switch";
import { VegetableThumb } from "./vegetable-thumb";
import { getVegetable } from "../_lib/vegetables";
import { togglePriceAlert, usePriceAlerts } from "../_lib/price-alerts-store";

// 가격 알림 설정 — 찜한 야채마다 켜고 끄는 토글. 실제 발송은 없음(프로토타입, 예시 UI).
export function PriceAlertSettings({ favorites }: { favorites: string[] }) {
  const alerts = usePriceAlerts();

  if (favorites.length === 0) {
    return (
      <section aria-label="가격 알림 설정" className="flex flex-col gap-3">
        <h2 className="text-body-16-semibold text-fg-neutral">가격 알림</h2>
        <p className="rounded-xl bg-bg-neutral-weak px-4 py-6 text-center text-body-14-regular text-fg-neutral-muted">
          찜한 야채가 있으면 가격이 떨어질 때 알려드려요.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="가격 알림 설정" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-body-16-semibold text-fg-neutral">가격 알림</h2>
        <span className="text-caption-12-regular text-fg-neutral-muted">예시 기능 · 실제 발송 없음</span>
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
              <VegetableThumb image={veg.image} emoji={veg.emoji} size="sm" />
              <span className="min-w-0 flex-1 text-body-14-medium text-fg-neutral">{veg.name} 시세 알림</span>
              {/* seed Switch로 교체 — 직접 만든 토글은 켜짐 배경에 존재하지 않는 토큰(bg-brand)을 써서
                  ON 상태가 무색으로 보였다. 정품은 상태 색·포커스 링·키보드 조작이 기본 내장이다. */}
              <Switch
                checked={enabled}
                onCheckedChange={() => togglePriceAlert(id)}
                aria-label={`${veg.name} 가격 알림 ${enabled ? "끄기" : "켜기"}`}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
