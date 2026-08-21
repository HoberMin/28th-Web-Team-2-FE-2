"use client";

import { useCallback, useRef, useState } from "react";
import { DEFAULT_NEARBY_STORE_RADIUS } from "@/app/_lib/api/schemas/stores";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { BadgeMapLocation } from "../../_components/badge-map-location";
import { ButtonCircle } from "../../_components/button-circle";
import { LoadingCircular } from "../../_components/loading-circular";
import { MarkerStoreMap, type MarkerStoreMapType } from "../../_components/marker-store-map";
import { TextField } from "../../_components/text-field";
import { clusterStoreMarkers, type MapScreenPoint } from "./_cluster";
import type { MapCenter, MapStore } from "./_data";
import {
  MapCanvas,
  type MapFocusRequest,
  type MapViewport,
} from "./_map-canvas";
import { StoreSheet } from "./_store-sheet";
import type { NearbyStoresState } from "./_nearby-state";
import { useNearbyStores } from "./_use-nearby-stores";

// F03 동네가게 — 검색 헤더 아래 지도. (Figma `화면GUI` 298:3605 · 3617 · 3630 · 3643,
// `F03_가게_기본_축소` 774:10912)
//
// 이 화면의 인터랙션이 전부 여기 모여 있어서 **여기가 유일한 client leaf**다
// (선택된 가게 · 찜 필터 · 검색어 · 지도 중심). 가게 목록은 same-origin BFF에서 조회한다.
//
// ── 레이어 (아래 → 위) ─────────────────────────────────────────────
//   z-0   지도 캔버스 (검색 헤더 아래, absolute inset-x-0 top-22 bottom-0)
//   z-10  마커 오버레이 — **중심 앵커**
//   z-20  상단 플로팅(검색 필드 + 배지/찜 필터 행)
//   z-30  바텀시트
//   GNB는 (tabs)/layout.tsx 소유 — 이 화면은 그리지 않는다.
//
// ── Figma dev annotation이 정의한 플로우 (그대로 구현) ──────────────
//   298:3628 "마켓 아이콘 클릭시, icon → name 속성 변경 및 바텀시트 노출"
//   298:3650 "찜버튼 클릭시, 찜한 가게들만 노출 / favorite(하트아이콘+이름)으로 속성 변경"
//
// ── 감사에서 확정된 것 ─────────────────────────────────────────────
// 🔴 상단 플로팅 행의 x는 **16**이다(Figma 4프레임 전부 15로 복붙 전파된 1px 어긋남이고,
//    같은 화면 `field/text`가 x=16 w=358로 대칭이다). y=161도 4의 배수가 아니라 스냅 없이
//    끌어놓은 정황이라, 좌표를 그대로 옮기지 않고 컨테이너 여백으로 정리했다:
//      · 검색 필드 top = 64 − Status Bar 44 = 20 → `top-5`
//      · 검색 필드 아래 간격 = 161 − 116 = 45 → **44로 정리** → `gap-11`
//      · 좌우 = 16 → `px-4`
//    Status Bar 44는 OS 것이라 코드에 없다 — 본문 좌표계는 Figma y에서 44를 뺀 값이다.
// 🔴 지도는 Figma y=132에서 시작한다. OS Status Bar 44를 빼면 앱 본문 y=88(`top-22`)이고,
//    검색 필드 하단(y=72)과 지도 사이에는 16px의 흰 여백이 남는다. 카카오맵이 반환하는
//    containerPoint 좌표와 마커가 어긋나지 않도록 지도·마커 오버레이는 같은 컨테이너를 쓴다.
// 🔴 마커는 **중심 앵커**(`-translate-x/y-1/2`)로 고정한다. icon(48) → name(108) →
//    favorite(128)은 서로 다른 부품이 아니라 같은 `marker/store-map`의 type 변형이고,
//    Figma의 좌표 변화(Δx=−40=−(128−48)/2 등)가 전부 "중심 보존"의 결과였다. 좌상단 기준으로
//    앉히면 type이 바뀔 때마다 핀이 튄다. 화면 밖으로 잘리는 건 정상 동작으로 허용한다.
//
// ── 상태 3종 ──────────────────────────────────────────────────────
// 로딩·에러·빈 결과 모두 지도 위 상태 오버레이로 알린다. 전용 시안은 없어 문구와 위계는
// 임시 구현이며, 마커·지도 조작 영역과 같은 컨테이너 안에서 중심 정렬한다.

// Figma F03_가게_기본_축소(774-10912): 지도 level 5 이상에서는 32px compact 마커를 쓰고,
// 서로 겹치는 가게는 count 배지가 붙은 마커 하나로 합친다. count 마커를 누르면 그룹 중심으로
// 이동하면서 level을 2 낮춘다(카카오맵은 level 값이 작을수록 확대).
const COMPACT_MARKER_LEVEL = 5;
const FALLBACK_MAP_SIZE = { width: 390, height: 721 } as const;

function createFallbackViewport(center: MapCenter, stores: readonly MapStore[]): MapViewport {
  const points: Record<string, MapScreenPoint> = {};
  for (const store of stores) {
    points[store.id] = {
      x: (FALLBACK_MAP_SIZE.width * store.x) / 100,
      y: (FALLBACK_MAP_SIZE.height * store.y) / 100,
    };
  }
  return { level: 5, center, points };
}

// ── 아이콘 (Figma 원본 SVG · `public/figma/design-library/icons/`) ──────────
// 색을 이 화면이 정해야 하는 자리만 `currentColor`로 넘긴다. 원본 색이 곧 정답인 자리는
// 그대로 둔다 — 어느 쪽인지는 SVG의 fill/stroke를 보고 정했다.

/** 마커 type=icon의 가게 핀. Figma 실측 24×23(정사각형이 아니다).
 *  원본이 `fill="white"`이고 마커 배경이 content/brand/light라 색을 덮지 않는다. */
function MarkerStorePinIcon() {
  return <FigmaIcon name="store-fill-marker-24" width={24} height={23} />;
}

/** 마커 type=favorite의 하트. 원본이 이미 #05a163(content/brand/light)이라 그대로 쓴다. */
function MarkerFavoriteHeartIcon() {
  return <FigmaIcon name="heart-fill-marker-16" width={16} />;
}

/** 검색 필드 trailing. Figma field/text의 normal 상태 아이콘이다(typing 상태의 close-fill은
 *  지우기 동작이 생길 때 붙인다 — 이번 범위 밖). 원본 색 그대로. */
function SearchIcon() {
  return <FigmaIcon name="search" width={24} />;
}

/** 지역 배지의 핀. 원본은 주황(#ff850a)이지만 배지가 아이콘 색(content/inverse)을 정하므로
 *  currentColor로 넘긴다 — `/playground` badge/map-location 스토리와 같은 처리다. */
function MapPinIcon() {
  return <FigmaIcon name="map-pin-fill" width={16} currentColor />;
}

/** 찜 필터 버튼의 하트. `ButtonCircle`이 state에 따라 글자색을 바꾸므로 currentColor다.
 *  Figma 실측(298:3637 normal · 298:3650 pressed) — 두 프레임 다 **외곽선 글리프**이고
 *  달라지는 건 색뿐이다(#262f3c → #05a163). 그래서 글리프는 바꾸지 않는다. */
function FilterHeartIcon() {
  return <FigmaIcon name="heart-stroke-regular" width={24} currentColor />;
}

/** 조회 상태 — ⚠️ Figma 시안 없음, 임시 구현. 디자이너 확인 항목. */
function StatusOverlay({
  title,
  description,
  error = false,
  loading = false,
}: {
  title: string;
  description: string;
  error?: boolean;
  loading?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4"
      role={error ? "alert" : "status"}
    >
      <div className="pointer-events-auto flex max-w-72 flex-col items-center gap-1 rounded-lg bg-surface-primary px-5 py-4 text-center shadow-floating">
        {loading ? <LoadingCircular animate currentColor className="text-content-brand-light" /> : null}
        <p className="text-body-16-semibold text-content-primary">{title}</p>
        <p className="text-body-14-regular text-content-secondary">{description}</p>
      </div>
    </div>
  );
}

export interface StoresMapViewProps {
  region: string;
  initialCenter: MapCenter;
  initialNearbyState: NearbyStoresState;
}

export function StoresMapView({ region, initialCenter, initialNearbyState }: StoresMapViewProps) {
  // 시트가 닫힐 때 돌아갈 자리가 사라져 있으면(마커가 걸러져 사라진 경우) 포커스가 body로
  // 떨어진다. 그때 착지할 곳으로 이 지도 영역을 넘긴다 — 이름표가 붙어 있어 보조기기가
  // "동네 가게 지도"를 읽어 준다.
  const mapRootRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [viewport, setViewport] = useState<MapViewport>(() =>
    createFallbackViewport(initialCenter, []),
  );
  const [focusRequest, setFocusRequest] = useState<MapFocusRequest | null>(null);
  const { stores, status, error } = useNearbyStores({
    center: viewport.center,
    radius: DEFAULT_NEARBY_STORE_RADIUS,
    keyword: query,
    onlyLiked: favoriteOnly,
    initialState: initialNearbyState,
  });
  const closeSelectedStore = useCallback(() => setSelectedId(null), []);
  const handleViewportChange = useCallback((nextViewport: MapViewport) => {
    setViewport(nextViewport);
  }, []);

  // 새 중심·검색·찜 필터 응답에서 선택 가게가 사라지면 시트도 같이 닫혀야 앞뒤가 맞는다.
  // 따로 닫는 effect를 두지 않고 현재 응답에서 파생한다.
  const selectedStore = stores.find((store) => store.id === selectedId) ?? null;

  // 하트 필터가 켜졌을 때만 보이는 모든 마커를 favorite(하트 + 이름)으로 표시한다.
  // 필터가 꺼진 기본 지도에서는 찜 여부를 마커에 드러내지 않고, 선택한 가게만 name으로 바꾼다.
  const markerType = (store: MapStore): MarkerStoreMapType => {
    if (favoriteOnly && store.isLiked) return "favorite"; // annotation 298:3650
    return store.id === selectedId ? "name" : "icon"; // annotation 298:3628
  };

  const compactMarkers = viewport.level >= COMPACT_MARKER_LEVEL;
  const markerClusters = compactMarkers
    ? clusterStoreMarkers(stores, viewport.points)
    : stores.flatMap((store) => {
        const point = viewport.points[store.id];
        return point ? [{ id: store.id, stores: [store], ...point }] : [];
      });

  const zoomIntoCluster = (clusterStores: readonly MapStore[]) => {
    const lat = clusterStores.reduce((sum, store) => sum + store.lat, 0) / clusterStores.length;
    const lng = clusterStores.reduce((sum, store) => sum + store.lng, 0) / clusterStores.length;
    setSelectedId(null);
    setFocusRequest({
      lat,
      lng,
      level: Math.max(1, viewport.level - 2),
    });
  };

  return (
    <div
      ref={mapRootRef}
      role="region"
      aria-label="동네 가게 지도"
      tabIndex={-1}
      className="relative h-full w-full overflow-hidden bg-surface-primary focus-visible:outline-none"
    >
      {/* Figma y=132 - OS Status Bar 44 = 앱 본문 y=88. 지도와 마커는 반드시 같은
          containing block을 써야 Kakao containerPoint 좌표가 그대로 맞는다. */}
      <div className="absolute inset-x-0 top-22 bottom-0">
        <MapCanvas
          initialCenter={initialCenter}
          stores={stores}
          onMapClick={closeSelectedStore}
          onViewportChange={handleViewportChange}
          focusRequest={focusRequest}
        />

        {/* 마커 오버레이 — 중심 앵커. 컨테이너는 탭을 가로막지 않고 마커만 받는다. */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {markerClusters.map((cluster) => {
            const isCluster = cluster.stores.length > 1;
            const store = cluster.stores[0];
            const type =
              isCluster || (compactMarkers && !favoriteOnly) ? "icon" : markerType(store);
            // 🔴 찜 여부는 **여기 aria-label에 넣어야** 한다. `MarkerStoreMap`은 favorite일 때
            //    안쪽에 `sr-only` "찜한 가게"를 넣지만, 감싼 버튼의 aria-label이 접근 가능한
            //    이름을 통째로 대체해서 그 텍스트가 통째로 삼켜진다(WCAG 1.1.1 — 시각 사용자만
            //    하트를 보고 찜 여부를 알게 되는 상태였다).
            const label = isCluster
              ? `가게 ${cluster.stores.length}곳 확대해서 보기`
              : `${store.name}${store.isLiked ? " 찜한 가게" : ""} 가게 정보 보기`;

            return (
              <button
                key={cluster.id}
                type="button"
                onClick={() =>
                  isCluster ? zoomIntoCluster(cluster.stores) : setSelectedId(store.id)
                }
                aria-label={label}
                className="pointer-events-auto absolute flex min-h-11 min-w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
                style={{
                  left: cluster.x,
                  top: cluster.y,
                  transform: isCluster
                    ? "translate(-50%, calc(-100% + 16px))"
                    : "translate(-50%, -50%)",
                }}
              >
                <MarkerStoreMap
                  type={type}
                  size={compactMarkers ? "compact" : "regular"}
                  count={isCluster ? cluster.stores.length : undefined}
                  label={isCluster ? `${cluster.stores.length}개 가게` : store.name}
                  icon={
                    type === "icon" ? (
                      <MarkerStorePinIcon />
                    ) : type === "favorite" ? (
                      <MarkerFavoriteHeartIcon />
                    ) : undefined
                  }
                />
              </button>
            );
          })}
        </div>

        {status === "loading" ? (
          <StatusOverlay
            loading
            title="주변 가게를 찾고 있어요"
            description="지도를 움직이면 새 중심을 기준으로 다시 찾아요."
          />
        ) : null}
        {status === "error" ? (
          <StatusOverlay
            error
            title="주변 가게를 불러오지 못했어요"
            description={error ?? "잠시 후 다시 시도해 주세요."}
          />
        ) : null}
        {status === "success" && stores.length === 0 ? (
          <StatusOverlay
            title={favoriteOnly ? "찜한 가게가 없어요" : "검색 결과가 없어요"}
            description={
              query.trim()
                ? "가게 이름의 일부만 넣어 다시 찾아보세요."
                : "지도를 움직여 다른 지역의 가게를 찾아보세요."
            }
          />
        ) : null}
      </div>

      {/* 상단 플로팅. 컨테이너는 지도 조작을 막지 않고 컨트롤만 탭을 받는다. */}
      <div className="pointer-events-none absolute inset-x-0 top-5 z-20 flex flex-col gap-11 px-4">
        <TextField
          className="pointer-events-auto"
          type="search"
          aria-label="가게 검색"
          placeholder="가게를 검색하세요"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          trailing={<SearchIcon />}
        />
        {/* items-start가 맞다 — 30px 배지가 48px 버튼과 **위쪽**으로 정렬된다(행 높이는 버튼이 정한다). */}
        <div className="flex items-start justify-between">
          <BadgeMapLocation
            className="pointer-events-auto"
            label={region}
            icon={<MapPinIcon />}
          />
          <ButtonCircle
            className="pointer-events-auto"
            variant="stroke"
            state={favoriteOnly ? "pressed" : "normal"}
            // 토글이라 호출부가 aria-pressed를 직접 넘긴다 (button-circle.tsx의 결론).
            aria-pressed={favoriteOnly}
            aria-label="찜한 가게만 보기"
            icon={<FilterHeartIcon />}
            onClick={() => {
              setFavoriteOnly((prev) => !prev);
              setSelectedId(null);
            }}
          />
        </div>
      </div>

      {/* 바텀시트. ⚠️ Figma는 시트(442~844)가 GNB(765~844)를 완전히 덮지만, 여기서는 GNB 위에
          올린다 — GNB는 (tabs)/layout.tsx가 소유하고 이 화면 바깥에 있으며, 시안에 드래그
          핸들이 없어 X·지도 빈 영역·Esc로 닫을 수 있다. 탭 이동까지 막으면 사용자가 갇힌다.
          감사에서 미결로 남은 항목이다(디자이너 확인 필요). */}
      {selectedStore ? (
        <div className="absolute inset-x-0 bottom-0 z-30">
          <StoreSheet
            store={selectedStore}
            center={viewport.center}
            onClose={closeSelectedStore}
            fallbackFocusRef={mapRootRef}
          />
        </div>
      ) : null}
    </div>
  );
}
