"use client";

import IconHeartFill from "@karrotmarket/react-monochrome-icon/IconHeartFill";
import IconHeartLine from "@karrotmarket/react-monochrome-icon/IconHeartLine";
import { toggleFavoriteStore, useIsFavoriteStore } from "../_lib/favorite-stores-store";

// 찜한 가게 토글 — 가게 상세(F09) 앱바 우측.
// 아이콘만 있는 버튼이라 aria-label로 상태까지 말한다(모양만으로는 켜짐/꺼짐이 안 읽힌다).
//
// 2026-08-04: 북마크 → 하트. 야채 찜(FavoriteButton)은 이미 하트였는데 가게만 북마크라,
// 같은 행동("담아두기")에 기호가 둘이었다. 「찜」 탭·지도 FAB도 하트로 통일했다.
export function FavoriteStoreButton({ storeName }: { storeName: string }) {
  const isFavorite = useIsFavoriteStore(storeName);

  return (
    <button
      type="button"
      onClick={() => toggleFavoriteStore(storeName)}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? `${storeName} 찜 해제` : `${storeName} 찜하기`}
      className={`flex size-12 items-center justify-center rounded-full [&_svg]:size-6 ${
        isFavorite ? "text-red-600" : "text-content-secondary"
      }`}
    >
      {isFavorite ? <IconHeartFill /> : <IconHeartLine />}
    </button>
  );
}
