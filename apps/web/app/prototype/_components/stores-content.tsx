"use client";

import { useFavoriteStores } from "../_lib/favorite-stores-store";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { summarizeStores, type PriceMap } from "../_lib/stores";
import { BASELINE_LABEL } from "../_lib/format";
import { StoreRow } from "./store-row";
import { EmptyState } from "./empty-state";

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

  // 위치를 아직 못 불러온 동안은 계산 자체를 하지 않는다 — district가 기본값(삼성동)으로
  // 잠깐 고정돼 있어, 그 값으로 만든 목록을 그대로 보여주면 다른 동네 사용자에게
  // 삼성동 목록이 스친다(백로그 F07).
  if (loading) return <StoresLoading />;

  const all = summarizeStores(reports, priceMap, todayIso);
  // 전체 기준 순위를 먼저 매기고 나서 단골/나머지로 나눈다 — 단골로 뺀 뒤 남은 것에 다시
  // 1번부터 매기면 실제 1위를 단골 등록한 순간 2위가 "1"로 보이는 버그가 생긴다(백로그 F07).
  const rankByName = new Map(all.map((s, i) => [s.name, i + 1]));
  const favorites = all.filter((s) => favoriteStores.includes(s.name));
  const others = all.filter((s) => !favoriteStores.includes(s.name));
  // 단골 저장은 가게 이름 배열이라 데이터는 그대로 있다 — 다른 동네로 옮기면 이번 목록(all)에
  // 없을 뿐이다. 그 차이를 접힌 줄로 알려줘 "단골이 사라졌다"고 오해하지 않게 한다(백로그 F07).
  const hiddenFavoritesCount = favoriteStores.filter(
    (name) => !favorites.some((f) => f.name === name),
  ).length;

  return (
    <div className="flex flex-col gap-6 px-4 pt-1 pb-8">
      {(favorites.length > 0 || hiddenFavoritesCount > 0) && (
        <section aria-label="내 단골 가게" className="flex flex-col gap-3">
          <h2 className="text-head2-18 text-fg-neutral">내 단골 가게</h2>
          {favorites.length > 0 && (
            <ul className="flex flex-col gap-2">
              {favorites.map((s) => (
                <StoreRow key={s.name} store={s} rank={rankByName.get(s.name)} />
              ))}
            </ul>
          )}
          {hiddenFavoritesCount > 0 && (
            <p className="text-caption-12-regular text-fg-neutral-muted">
              다른 동네 단골 {hiddenFavoritesCount}곳은 지금 동네 목록에 안 보여요.
            </p>
          )}
        </section>
      )}

      <section aria-label="우리 동네 매장" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-head2-18 text-fg-neutral">{district} 매장</h2>
          <p className="text-caption-12-regular text-fg-neutral-muted">
            {BASELINE_LABEL} 대비 · 이웃 제보 기준 싼 가게 순
          </p>
        </div>

        {others.length === 0 ? (
          <EmptyState>
            아직 {district}에 가게별 제보가 없어요.
            <br />
            제보할 때 가게를 골라주시면 여기 목록이 생겨요.
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {others.map((s) => (
              <StoreRow key={s.name} store={s} rank={rankByName.get(s.name)} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** 위치를 아직 못 불러온 동안의 자리표시 — 빈 상태와 다른 모양이어야 깜빡임으로 안 읽힌다. */
function StoresLoading() {
  return (
    <div className="flex flex-col gap-3 px-4 pt-1 pb-8" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-bg-neutral-weak" />
      ))}
    </div>
  );
}
