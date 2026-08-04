"use client";

import Link from "next/link";
import { VegetableThumb } from "./vegetable-thumb";
import { getVegetable } from "../_lib/vegetables";
import { useFavorites } from "../_lib/favorites-store";
import type { PriceMap } from "../_lib/stores";
import { formatNumber } from "../_lib/format";
import { FavoriteButton } from "./favorite-button";
import { EmptyState } from "./empty-state";

// 찜 탭 「야채」 — 찜한 야채 목록.
//
// 세로 리스트에서 3열 그리드로 바꿨다(2026-08-04). 야채시세 탭(F01-1)과 같은 카드 모양이라,
// 두 화면을 오갈 때 같은 것을 같은 모양으로 본다. 리스트일 때는 한 화면에 4~5개뿐이어서
// "내가 찜한 것들"이 한눈에 안 들어왔다.
//
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
    <ul className="grid grid-cols-3 gap-2.5">
      {favorites.map((id) => {
        const veg = getVegetable(id);
        if (!veg) return null;
        const price = priceMap[veg.id] ?? null;
        return (
          <li key={id} className="relative">
            <Link
              href={`/prototype/price/${veg.id}`}
              className="flex h-full flex-col items-center gap-1 rounded-2xl bg-gray-100 px-2 py-3 active:bg-gray-200"
            >
              <VegetableThumb image={veg.image} emoji={veg.emoji} size="lg" />
              <span className="line-clamp-1 text-center text-body-14-medium text-content-primary">
                {veg.name}
              </span>
              {price === null ? (
                <span className="text-caption-12-regular text-content-secondary">
                  {veg.season?.label ?? "지금은 비수기"}
                </span>
              ) : (
                <span className="text-body-14-medium tabular-nums text-content-primary">
                  {formatNumber(price)}원
                </span>
              )}
            </Link>
            {/* 찜 해제는 카드 위 오른쪽 위에 얹는다 — 그리드에선 행 끝에 둘 자리가 없다.
                카드 링크와 겹치지 않게 Link 밖에 두고 절대 배치한다. */}
            <span className="absolute right-0.5 top-0.5">
              <FavoriteButton vegetableId={veg.id} vegetableName={veg.name} size="sm" />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
