"use client";

import IconBookmarkFill from "@karrotmarket/react-monochrome-icon/IconBookmarkFill";
import IconBookmarkLine from "@karrotmarket/react-monochrome-icon/IconBookmarkLine";
import { toggleFavoriteStore, useIsFavoriteStore } from "../_lib/favorite-stores-store";

// 단골 가게 토글 — 가게 상세(F09) 앱바 우측.
// 아이콘만 있는 버튼이라 aria-label로 상태까지 말한다(북마크 모양만으로는 켜짐/꺼짐이 안 읽힌다).
export function FavoriteStoreButton({ storeName }: { storeName: string }) {
  const isFavorite = useIsFavoriteStore(storeName);

  return (
    <button
      type="button"
      onClick={() => toggleFavoriteStore(storeName)}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? `${storeName} 단골 해제` : `${storeName} 단골로 등록`}
      className={`flex size-12 items-center justify-center rounded-full [&_svg]:size-6 ${
        isFavorite ? "text-fg-brand" : "text-fg-neutral-subtle"
      }`}
    >
      {isFavorite ? <IconBookmarkFill /> : <IconBookmarkLine />}
    </button>
  );
}
