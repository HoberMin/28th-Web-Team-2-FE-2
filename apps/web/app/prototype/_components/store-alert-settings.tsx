"use client";

import Link from "next/link";
import { Switch } from "seed-design/ui/switch";
import IconTrashcanLine from "@karrotmarket/react-monochrome-icon/IconTrashcanLine";
import { toggleFavoriteStore, useFavoriteStores } from "../_lib/favorite-stores-store";
import { toggleStoreAlert, useStoreAlerts } from "../_lib/store-alerts-store";
import { EmptyState } from "./empty-state";

// F05-5 「단골 가게」 화면 본문 — 목록 + 매장 알림 토글 + 단골 해제를 한 화면에 모은다.
// 이전엔 알림이 "단골 가게 기준"이라고 말하면서도 정작 목록·해제는 홈·매장 탭에만 있었다
// (알림을 끄려면 여기, 단골을 끊으려면 저기를 오가야 했다) — 알림의 대상(단골 목록)과
// 알림 스위치를 같은 화면에 두어 그 모순을 없앤다.
export function StoreAlertSettings() {
  const favoriteStores = useFavoriteStores();
  const alerts = useStoreAlerts();

  if (favoriteStores.length === 0) {
    return (
      <EmptyState>
        아직 단골 가게가 없어요.
        <br />
        가게 상세에서 단골로 등록하면 여기에 모여요.
      </EmptyState>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {favoriteStores.map((name) => {
        const enabled = alerts.includes(name);
        return (
          <li key={name} className="flex items-center gap-2 rounded-2xl bg-bg-neutral-weak px-4 py-3">
            <Link
              href={`/prototype/store/${encodeURIComponent(name)}`}
              className="min-w-0 flex-1 rounded-xl active:opacity-70"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-body-14-medium text-fg-neutral">{name}</span>
                <span className="text-caption-12-regular text-fg-neutral-muted">
                  더 싼 가격이 올라오면 알림
                </span>
              </span>
            </Link>
            {/* seed Switch — 상태 색·포커스 링·키보드 조작이 기본 내장 */}
            <Switch
              checked={enabled}
              onCheckedChange={() => toggleStoreAlert(name)}
              aria-label={`${name} 알림 ${enabled ? "끄기" : "켜기"}`}
            />
            <button
              type="button"
              onClick={() => toggleFavoriteStore(name)}
              aria-label={`${name} 단골 해제`}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-fg-neutral-muted active:bg-bg-neutral-weak-pressed [&_svg]:size-5"
            >
              <IconTrashcanLine />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
