"use client";

import { Switch } from "seed-design/ui/switch";
import { useFavoriteStores } from "../_lib/favorite-stores-store";
import { toggleStoreAlert, useStoreAlerts } from "../_lib/store-alerts-store";

// 매장 알림 설정 — 단골 가게마다 켜고 끄는 토글.
// 알림 하나로 통합했다(이전엔 찜한 야채별 가격 알림). 가격이 싸졌다는 소식에 목적지가 붙어 있어야
// 다음 행동이 생긴다 — "감자 쌈"보다 "늘 가던 그 집에 싼 게 올라옴"이 움직이게 만든다.
export function StoreAlertSettings() {
  const favoriteStores = useFavoriteStores();
  const alerts = useStoreAlerts();

  return (
    <section aria-label="매장 알림 설정" className="flex flex-col gap-3">
      <h2 className="text-body-16-semibold text-fg-neutral">매장 알림</h2>

      {favoriteStores.length === 0 ? (
        <p className="rounded-xl bg-bg-neutral-weak px-4 py-6 text-center text-body-14-regular text-fg-neutral-muted">
          단골 가게를 등록하면
          <br />더 싼 가격이 올라올 때 알려드려요.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {favoriteStores.map((name) => {
            const enabled = alerts.includes(name);
            return (
              <li key={name} className="flex items-center gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body-14-medium text-fg-neutral">{name}</span>
                  <span className="text-caption-12-regular text-fg-neutral-muted">
                    더 싼 가격이 올라오면 알림
                  </span>
                </span>
                {/* seed Switch — 상태 색·포커스 링·키보드 조작이 기본 내장 */}
                <Switch
                  checked={enabled}
                  onCheckedChange={() => toggleStoreAlert(name)}
                  aria-label={`${name} 알림 ${enabled ? "끄기" : "켜기"}`}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
