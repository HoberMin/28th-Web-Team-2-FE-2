"use client";

import IconHeartFill from "@karrotmarket/react-monochrome-icon/IconHeartFill";
import IconHeartLine from "@karrotmarket/react-monochrome-icon/IconHeartLine";
import { toggleFavorite, useIsFavorite } from "../_lib/favorites-store";

interface FavoriteButtonProps {
  vegetableId: string;
  vegetableName: string;
  /** sm=홈 그리드 카드 코너, md=상세 상단바 */
  size?: "sm" | "md";
}

// 찜 토글 버튼 — 채워진 하트(brand)/빈 하트(subtle). 목록·상세 공용.
export function FavoriteButton({ vegetableId, vegetableName, size = "md" }: FavoriteButtonProps) {
  const favorite = useIsFavorite(vegetableId);
  // 두 사이즈 모두 44px 히트 영역(모바일 UT 터치 타겟) — 아이콘 크기만 다르게.
  const box = size === "sm" ? "size-11 [&_svg]:size-5" : "size-11 [&_svg]:size-6";

  return (
    <button
      type="button"
      aria-pressed={favorite}
      aria-label={`${vegetableName} 찜${favorite ? " 해제" : ""}`}
      onClick={() => toggleFavorite(vegetableId)}
      className={`flex items-center justify-center rounded-full transition-colors ${box} ${
        favorite ? "text-fg-brand" : "text-fg-neutral-subtle"
      } hover:bg-bg-neutral-weak`}
    >
      {favorite ? <IconHeartFill /> : <IconHeartLine />}
    </button>
  );
}
