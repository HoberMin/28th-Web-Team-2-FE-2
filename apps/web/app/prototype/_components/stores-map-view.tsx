"use client";

// 동네 가게 탭 — 화면 전체가 지도다(네이버 지도 앱과 같은 구조).
//
// 실제 지도 SDK 대신 회색 배경 + "지도" 라벨로 자리만 잡는다(2026-08-04, 프로토타입 방향 확정).
// 카카오맵 앱키 설정·도메인 등록에 기대면 환경(로컬/배포 프리뷰)마다 렌더 여부가 갈린다 — 이 화면이
// 검증하려는 건 "지도 위에서 핀을 눌러 가게 상세를 본다"는 인터랙션이지 실제 지리 정확도가 아니라서,
// 가짜 배경 위에 상대 위치로 흩은 핀이면 충분하다.
//
// 핀 좌표는 가게 위치의 동 중심 대비 오프셋(store-locations.ts)을 그대로 %로 편다. 실좌표 투영이
// 아니라 "서로 겹치지 않게 흩어져 있다"는 느낌만 준다.

import { useState } from "react";
import IconHeartFill from "@karrotmarket/react-monochrome-icon/IconHeartFill";
import IconHeartLine from "@karrotmarket/react-monochrome-icon/IconHeartLine";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetRoot,
} from "seed-design/ui/bottom-sheet";
import { useCurrentCoords, useCurrentDistrict } from "../_lib/location";
import { useReports } from "../_lib/reports-store";
import { useFavoriteStores } from "../_lib/favorite-stores-store";
import { getStoreItems, summarizeStores, type PriceMap } from "../_lib/stores";
import { distanceMeters, getStoreLocation, offsetToPercent } from "../_lib/store-locations";
import { StoreSheetBody } from "./store-sheet-body";
import { EmptyState } from "./empty-state";

export function StoresMapView({ priceMap, todayIso }: { priceMap: PriceMap; todayIso: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  // 찜한 가게만 보기 — FAB로 토글. 기본은 전체(처음 온 사람은 찜이 0개라 빈 지도가 된다).
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const { district, loading } = useCurrentDistrict();
  const coords = useCurrentCoords();
  const reports = useReports({ district });
  const favoriteStores = useFavoriteStores();

  const all = loading ? [] : summarizeStores(reports, priceMap, todayIso);
  const shown = favoritesOnly ? all.filter((s) => favoriteStores.includes(s.name)) : all;
  const selectedStore = shown.find((s) => s.name === selected) ?? null;
  // 최근 제보 3건 — getStoreItems는 싼 순 정렬이라 시트에서 보여줄 "최근"은 제보 시점(일수) 기준으로
  // 다시 줄 세운다. 이상치(시세의 3배↑/⅓↓ — 오타 의심)는 뺀다. 지도에서 핀만 누르고 보는 압축
  // 미리보기라 상세 페이지(store-detail.tsx)처럼 "확인 필요" 경고를 붙일 자리가 없다 — 그대로
  // 보여주면 오타성 가격이 정상 가격처럼 읽힌다.
  const recentItems = selectedStore
    ? [...getStoreItems(reports, selectedStore.name, priceMap, todayIso)]
        .filter((i) => !i.outlier)
        .sort((a, b) => a.freshness.days - b.freshness.days)
        .slice(0, 3)
    : [];

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* 지도 자리 — 실제 SDK 없이 회색 배경 + 라벨로 화면을 꽉 채운다 */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-bg-neutral-weak">
        <p
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-head1-24 text-fg-neutral-muted"
        >
          지도
        </p>

        {shown.map((store) => {
          const location = getStoreLocation(store.name, store.district);
          const isFavorite = favoriteStores.includes(store.name);
          return (
            <button
              key={store.name}
              type="button"
              onClick={() => setSelected(store.name)}
              aria-label={`${store.name} 정보 보기`}
              style={{
                left: `${offsetToPercent(location.lngOffset)}%`,
                top: `${offsetToPercent(-location.latOffset)}%`,
              }}
              className="absolute flex max-w-32 -translate-x-1/2 -translate-y-full items-center gap-1 rounded-full border border-bg-neutral-weak bg-bg-layer-default px-2.5 py-1.5 text-caption-12-medium text-fg-neutral shadow-md"
            >
              <span className="truncate">{isFavorite ? `♥ ${store.name}` : store.name}</span>
            </button>
          );
        })}

        {shown.length === 0 && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2">
            <EmptyState>
              {favoritesOnly ? "찜한 가게가 아직 없어요." : `아직 ${district}에 가게별 제보가 없어요.`}
              <br />
              {favoritesOnly
                ? "가게 상세에서 하트를 눌러 담아보세요."
                : "제보할 때 가게를 골라주시면 여기 핀이 생겨요."}
            </EmptyState>
          </div>
        )}
      </div>

      {/* FAB — 찜한 가게만 지도에 남긴다. 켜졌는지는 색 하나가 아니라 채운 하트 + aria-pressed로도 알린다. */}
      <button
        type="button"
        onClick={() => setFavoritesOnly(!favoritesOnly)}
        aria-pressed={favoritesOnly}
        aria-label={favoritesOnly ? "찜한 가게만 보기 해제" : "찜한 가게만 보기"}
        className={`absolute bottom-4 right-4 flex size-12 items-center justify-center rounded-full shadow-lg [&_svg]:size-6 ${
          favoritesOnly
            ? "bg-bg-brand-solid text-fg-neutral-inverted"
            : "bg-bg-layer-default text-fg-neutral"
        }`}
      >
        {favoritesOnly ? <IconHeartFill /> : <IconHeartLine />}
      </button>

      {/* 핀을 누르면 가게 정보 — 화면을 통째로 덮지 않고 시트로 띄운다(지도 맥락 유지) */}
      <BottomSheetRoot open={selected !== null} onOpenChange={(next) => !next && setSelected(null)}>
        <BottomSheetContent title={selectedStore?.name ?? ""} showHandle>
          <BottomSheetBody className="pb-4">
            {selectedStore && (
              <StoreSheetBody
                store={selectedStore}
                meters={distanceMeters(
                  coords,
                  getStoreLocation(selectedStore.name, selectedStore.district),
                )}
                recentItems={recentItems}
              />
            )}
          </BottomSheetBody>
        </BottomSheetContent>
      </BottomSheetRoot>
    </div>
  );
}
