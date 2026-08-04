"use client";

// 동네 가게 탭 — 화면 전체가 지도다(네이버 지도 앱과 같은 구조).
//
// 2026-08-04 개편: 이전엔 「내 단골」 + 「우리 동네 가게(싼 순)」 두 층의 목록이었다. 목록은
// 순위를 읽게 하지만, 이 탭에서 사용자가 실제로 하는 판단은 "지금 여기서 갈 만한가"이고 그건
// 거리 감각 없이는 안 선다. 그래서 지도를 주(主)로 올리고, 가게 정보는 핀을 눌렀을 때
// 바텀시트로 준다 — 목록으로 훑는 경로는 「찜」 탭이 이미 갖고 있다.
//
// 핀은 CustomOverlay(HTML)로 그린다. Marker 이미지로는 "찜한 가게는 하트" 같은 표시를 넣기
// 어렵고, DOM이면 클릭 핸들러도 그대로 붙는다.
//
// 지도를 못 그리는 환경(앱키 미설정·SDK 로드 실패)에서는 **목록으로 폴백**한다. 지도 하나에
// 탭 전체를 걸었으니, 실패했을 때 빈 화면이 되면 탭이 죽는다.

import { useEffect, useRef, useState } from "react";
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
import { summarizeStores, type PriceMap } from "../_lib/stores";
import { distanceMeters, getStoreLocation } from "../_lib/store-locations";
import { loadKakaoSdk, type KakaoCustomOverlay, type MapLoadStatus } from "../_lib/kakao-map";
import { StoreRow } from "./store-row";
import { StoreSheetBody } from "./store-sheet-body";
import { EmptyState } from "./empty-state";

export function StoresMapView({ priceMap, todayIso }: { priceMap: PriceMap; todayIso: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // 이미 그린 오버레이 — 찜 필터를 끌 때 지도에서 떼어내려면 참조를 들고 있어야 한다.
  const overlaysRef = useRef<KakaoCustomOverlay[]>([]);
  // 앱키(도메인 제한 걸린 공개 키 — 시크릿 아님)가 없으면 시도 자체를 안 하므로 처음부터 failed다.
  // 이 판정을 effect에서 setState로 하면 렌더가 한 번 더 돌고(cascading render 린트)
  // 회색 캔버스가 한 프레임 스친다.
  const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  const [status, setStatus] = useState<MapLoadStatus>(appKey ? "loading" : "failed");
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
  // 핀을 다시 그릴 기준 — shown 배열은 매 렌더 새 객체라 의존성에 그대로 넣으면 무한 재실행된다.
  // "어느 가게가 보이는가"만 바뀔 때 다시 그리면 되므로 이름 목록으로 좁힌다.
  const shownKey = shown.map((s) => s.name).join(",");

  // 지도 + 핀. shown이 바뀌면(찜 토글·제보 추가) 오버레이를 다시 그린다.
  useEffect(() => {
    if (!containerRef.current || !appKey) return;
    let cancelled = false;

    loadKakaoSdk(appKey).then((kakao) => {
      const container = containerRef.current;
      if (cancelled || !container) return;
      if (!kakao) {
        setStatus("failed");
        return;
      }

      const center = new kakao.maps.LatLng(coords.lat, coords.lng);
      const map = new kakao.maps.Map(container, { center, level: 5 });

      overlaysRef.current.forEach((overlay) => overlay.setMap(null));
      overlaysRef.current = shown.map((store) => {
        const location = getStoreLocation(store.name, store.district);
        const isFavorite = favoriteStores.includes(store.name);

        // 핀 = 가게명 + (찜이면) 하트. 텍스트를 넣는 이유는 지도에서 이름 없이 점만 보면
        // 어디가 어딘지 눌러봐야 알기 때문이다.
        const pin = document.createElement("button");
        pin.type = "button";
        pin.className =
          "flex max-w-32 items-center gap-1 rounded-full border border-bg-neutral-weak bg-bg-layer-default px-2.5 py-1.5 text-caption-12-medium text-fg-neutral shadow-md";
        pin.setAttribute("aria-label", `${store.name} 정보 보기`);
        pin.textContent = isFavorite ? `♥ ${store.name}` : store.name;
        pin.addEventListener("click", () => setSelected(store.name));

        return new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(location.lat, location.lng),
          content: pin,
          map,
          yAnchor: 1,
          clickable: true,
        });
      });

      setStatus("ready");
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shown 대신 shownKey(이름 목록)로
    // 좁힌 의도적 선택이다. shown 배열은 매 렌더 새 객체라 넣으면 무한 재실행된다.
  }, [appKey, coords.lat, coords.lng, favoriteStores, shownKey]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* 지도 캔버스 — 정보(가게명·거리·가격)는 핀과 바텀시트가 전달하므로 캔버스 자체는 숨긴다 */}
      {status !== "failed" && (
        <div ref={containerRef} aria-hidden="true" className="min-h-0 flex-1 bg-bg-neutral-weak" />
      )}

      {status === "loading" && (
        <p className="sr-only" role="status">
          지도를 불러오는 중이에요
        </p>
      )}

      {/* 키보드·스크린리더용 대체 경로. 핀은 지도 캔버스(aria-hidden) 안에 있어 보조기술로는
          닿지 않는다 — 같은 시트를 여는 버튼 목록을 sr-only로 함께 둔다(WCAG 2.1.1).
          지도가 실패했을 때는 아래 폴백 목록이 이미 보이므로 중복으로 두지 않는다. */}
      {status !== "failed" && shown.length > 0 && (
        <nav className="sr-only" aria-label="지도에 표시된 가게">
          <ul>
            {shown.map((store) => (
              <li key={store.name}>
                <button type="button" onClick={() => setSelected(store.name)}>
                  {store.name} 정보 보기
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* 폴백 — 지도를 못 그리면 목록으로. 탭이 빈 화면으로 죽지 않게 한다. */}
      {status === "failed" && (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar px-4 pb-4 pt-3">
          <p className="mb-3 text-caption-12-regular text-fg-neutral-muted" role="status">
            지도를 표시할 수 없어 목록으로 보여드려요
          </p>
          {shown.length === 0 ? (
            <EmptyState>
              {favoritesOnly ? "찜한 가게가 아직 없어요." : `아직 ${district}에 가게별 제보가 없어요.`}
              <br />
              {favoritesOnly
                ? "가게 상세에서 하트를 눌러 담아보세요."
                : "제보할 때 가게를 골라주시면 여기 목록이 생겨요."}
            </EmptyState>
          ) : (
            <ul className="flex flex-col gap-2">
              {shown.map((store) => (
                <StoreRow key={store.name} store={store} />
              ))}
            </ul>
          )}
        </div>
      )}

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
              />
            )}
          </BottomSheetBody>
        </BottomSheetContent>
      </BottomSheetRoot>
    </div>
  );
}

