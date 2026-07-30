"use client";

import Link from "next/link";
import { VegetableThumb } from "./vegetable-thumb";
import { getVegetable } from "../_lib/vegetables";
import { useFavorites } from "../_lib/favorites-store";
import type { PriceMap } from "../_lib/stores";
import { formatWon } from "../_lib/format";
import { FavoriteButton } from "./favorite-button";
import { EmptyState } from "./empty-state";

// 마이페이지 「찜한 야채」 화면 — 이전엔 마이페이지 탭 중 하나였던 목록을 독립 화면으로 옮겼다.
// priceMap은 서버(getPriceMap())가 내려준 오늘 시세 — 홈·시세 화면과 같은 기준(예전엔 더미
// 기준선을 직접 계산해 화면마다 "오늘 시세"가 갈렸다, F05 버그 항목).
export function FavoritesView({ priceMap }: { priceMap: PriceMap }) {
  const favorites = useFavorites();

  if (favorites.length === 0) {
    return (
      <EmptyState>
        아직 찜한 야채가 없어요.
        <br />
        관심 야채에 하트를 눌러 보세요.
      </EmptyState>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {favorites.map((id) => {
        const veg = getVegetable(id);
        if (!veg) return null;
        const price = priceMap[veg.id] ?? null;
        return (
          <li key={id} className="relative flex items-center rounded-2xl bg-bg-neutral-weak">
            <Link
              href={`/prototype/price/${veg.id}`}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl py-3 pl-3 pr-14 active:bg-bg-neutral-weak-pressed"
            >
              <VegetableThumb image={veg.image} emoji={veg.emoji} size="lg" />
              <span className="flex min-w-0 flex-col">
                <span className="text-body-16-semibold text-fg-neutral">{veg.name}</span>
                {price === null ? (
                  <span className="text-body-14-regular text-fg-neutral-muted">
                    {veg.season?.label ?? "지금은 비수기"}
                  </span>
                ) : (
                  <span className="text-body-14-regular text-fg-neutral-muted">
                    오늘 시세 {formatWon(price)} <span className="text-fg-neutral-muted">/{veg.unit}</span>
                  </span>
                )}
              </span>
            </Link>
            <span className="absolute right-2">
              <FavoriteButton vegetableId={veg.id} vegetableName={veg.name} size="sm" />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
