"use client";

import { useFavoriteStores } from "../_lib/favorite-stores-store";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { summarizeStores, type PriceMap } from "../_lib/stores";
import { StoreRow } from "./store-row";

// 매장 탭 — 이 서비스가 실제로 답하려는 질문("오늘 어디로 갈까")의 정면 화면.
//
// 두 층으로 나눈다:
//  1) 내 단골 — 재방문 사용자는 목적지가 이미 정해져 있다. 매번 순위를 훑게 하지 않는다.
//  2) 우리 동네 매장 — 시세 대비 평균이 싼 순. 첫 사용자는 단골이 없으므로 이 목록이 화면을 채운다
//     (그래서 단골 0개여도 빈 화면이 안 된다).
//
// 순위 기준이 "제보가 평균"이 아니라 **시세 대비 편차 평균**인 이유: 가게마다 제보된 품목 구성이
// 달라서, 금액을 그대로 평균 내면 비싼 품목이 많이 제보된 가게가 무조건 비싸 보인다.
// 그러면 매장이 아니라 품목 구성을 비교하게 된다.
export function StoresContent({ priceMap, todayIso }: { priceMap: PriceMap; todayIso: string }) {
  const { district, loading } = useCurrentDistrict();
  const reports = useReports({ district });
  const favoriteStores = useFavoriteStores();

  const all = summarizeStores(reports, priceMap, todayIso);
  const favorites = all.filter((s) => favoriteStores.includes(s.name));
  const others = all.filter((s) => !favoriteStores.includes(s.name));

  return (
    <div className="flex flex-col gap-6 px-4 pt-1 pb-8">
      {favorites.length > 0 && (
        <section aria-label="내 단골 가게" className="flex flex-col gap-3">
          <h2 className="text-head2-16 text-fg-neutral">내 단골 가게</h2>
          <ul className="flex flex-col gap-2">
            {favorites.map((s) => (
              <StoreRow key={s.name} store={s} />
            ))}
          </ul>
        </section>
      )}

      <section aria-label="우리 동네 매장" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-head2-16 text-fg-neutral">
            {loading ? "우리 동네 매장" : `${district} 매장`}
          </h2>
          <p className="text-caption-12-regular text-fg-neutral-muted">
            이웃 제보 기준 · 시세보다 싼 가게 순
          </p>
        </div>

        {others.length === 0 ? (
          <p className="rounded-xl bg-bg-neutral-weak px-4 py-10 text-center text-body-14-regular text-fg-neutral-muted">
            아직 {district}에 가게별 제보가 없어요.
            <br />
            제보할 때 가게를 골라주시면 여기 목록이 생겨요.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {others.map((s, i) => (
              <StoreRow key={s.name} store={s} rank={i + 1} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
