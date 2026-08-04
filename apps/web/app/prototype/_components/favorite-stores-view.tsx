"use client";

import Link from "next/link";
import IconTrashcanLine from "@karrotmarket/react-monochrome-icon/IconTrashcanLine";
import { toggleFavoriteStore, useFavoriteStores } from "../_lib/favorite-stores-store";
import { EmptyState } from "./empty-state";

// F05-5 「찜한 가게」 목록 본문 — 목록 + 찜 해제만 남긴다.
// 이전엔 가게별 알림 토글이 여기 같이 있었는데(구 store-alert-settings.tsx), 알림이 전역
// 토글 하나(설정 → 「내 정보」)로 바뀌면서 가게별 스위치가 의미가 없어졌다 — 알림 미리보기는
// 설정 화면에서 확인한다.
export function FavoriteStoresView() {
  const favoriteStores = useFavoriteStores();

  if (favoriteStores.length === 0) {
    return (
      <EmptyState>
        아직 찜한 가게가 없어요.
        <br />
        가게 상세에서 하트를 누르면 여기에 모여요.
      </EmptyState>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {favoriteStores.map((name) => (
        <li key={name} className="flex items-center gap-2 rounded-2xl bg-bg-neutral-weak px-4 py-3">
          <Link
            href={`/prototype/store/${encodeURIComponent(name)}`}
            className="min-w-0 flex-1 rounded-xl active:opacity-70"
          >
            <span className="truncate text-body-14-medium text-fg-neutral">{name}</span>
          </Link>
          <button
            type="button"
            onClick={() => toggleFavoriteStore(name)}
            aria-label={`${name} 찜 해제`}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-fg-neutral-muted active:bg-bg-neutral-weak-pressed [&_svg]:size-5"
          >
            <IconTrashcanLine />
          </button>
        </li>
      ))}
    </ul>
  );
}
