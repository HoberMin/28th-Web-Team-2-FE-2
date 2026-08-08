"use client";

import { useState } from "react";
import { BadgeMapLocation } from "../../_components/badge-map-location";
import { ButtonCircle } from "../../_components/button-circle";
import { MarkerStoreMap, type MarkerStoreMapType } from "../../_components/marker-store-map";
import { TextField } from "../../_components/text-field";
import type { MapStore } from "./_data";
import { IconSlot } from "./_icon-slot";
import { MapCanvas } from "./_map-canvas";
import { StoreSheet } from "./_store-sheet";

// F03 동네가게 — 지도 화면 전체. (Figma `화면GUI` 298:3605 · 3617 · 3630 · 3643)
//
// 이 화면의 인터랙션이 전부 여기 모여 있어서 **여기가 유일한 client leaf**다
// (선택된 가게 · 찜 목록 · 찜 필터 · 검색어). 데이터는 서버(page.tsx)에서 내려온다.
//
// ── 레이어 (아래 → 위) ─────────────────────────────────────────────
//   z-0   지도 캔버스 (absolute inset-0)
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
// 🔴 마커는 **중심 앵커**(`-translate-x/y-1/2`)로 고정한다. icon(48) → name(108) →
//    favorite(128)은 서로 다른 부품이 아니라 같은 `marker/store-map`의 type 변형이고,
//    Figma의 좌표 변화(Δx=−40=−(128−48)/2 등)가 전부 "중심 보존"의 결과였다. 좌상단 기준으로
//    앉히면 type이 바뀔 때마다 핀이 튄다. 화면 밖으로 잘리는 건 정상 동작으로 허용한다.
//
// ── 상태 3종 ──────────────────────────────────────────────────────
// 이 화면은 이번 사이클에 서버 통신이 없다(고정 더미) → **로딩·에러 상태는 만들지 않았다.**
// BFF가 붙으면 그때 추가한다. 빈 상태는 **시안이 없어 임시 구현**이다(아래 EmptyOverlay).
// 찜 필터는 반드시 "찜 0개"를 거치는 진입점이라 빈 상태 없이는 화면이 비어 버린다.

/** 빈 상태 — ⚠️ Figma 시안 없음, 임시 구현. 디자이너 확인 항목. */
function EmptyOverlay({ title, description }: { title: string; description: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4">
      <div className="pointer-events-auto flex max-w-72 flex-col items-center gap-1 rounded-lg bg-surface-primary px-5 py-4 text-center shadow-floating">
        <p className="text-body-16-semibold text-content-primary">{title}</p>
        <p className="text-body-14-regular text-content-secondary">{description}</p>
      </div>
    </div>
  );
}

export interface StoresMapViewProps {
  region: string;
  stores: MapStore[];
  initialFavoriteIds: string[];
}

export function StoresMapView({ region, stores, initialFavoriteIds }: StoresMapViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(initialFavoriteIds);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [query, setQuery] = useState("");

  const keyword = query.trim();
  const visibleStores = stores.filter(
    (store) =>
      (!favoriteOnly || favoriteIds.includes(store.id)) &&
      (keyword === "" || store.name.includes(keyword)),
  );

  // 선택된 가게를 **보이는 목록에서** 찾는다 — 찜을 풀거나 검색으로 걸러져 마커가 사라지면
  // 시트도 같이 닫혀야 앞뒤가 맞는다. 따로 닫는 effect를 두지 않기 위한 파생값이다.
  const selectedStore = visibleStores.find((store) => store.id === selectedId) ?? null;

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((favoriteId) => favoriteId !== id) : [...prev, id],
    );
  };

  const markerType = (store: MapStore): MarkerStoreMapType => {
    if (favoriteOnly) return "favorite"; // annotation 298:3650
    return store.id === selectedId ? "name" : "icon"; // annotation 298:3628
  };

  const noFavorites = favoriteOnly && favoriteIds.length === 0;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapCanvas />

      {/* 마커 오버레이 — 중심 앵커. 컨테이너는 탭을 가로막지 않고 마커만 받는다. */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {visibleStores.map((store) => (
          <button
            key={store.id}
            type="button"
            onClick={() => setSelectedId(store.id)}
            aria-label={`${store.name} 가게 정보 보기`}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${store.x}%`, top: `${store.y}%` }}
          >
            <MarkerStoreMap
              type={markerType(store)}
              label={store.name}
              icon={<IconSlot size={markerType(store) === "icon" ? 24 : 16} />}
            />
          </button>
        ))}
      </div>

      {noFavorites ? (
        <EmptyOverlay
          title="아직 찜한 가게가 없어요"
          description="지도에서 가게를 누르고 하트를 누르면 여기에 모여요."
        />
      ) : null}
      {!noFavorites && visibleStores.length === 0 ? (
        <EmptyOverlay
          title="검색 결과가 없어요"
          description="가게 이름의 일부만 넣어 다시 찾아보세요."
        />
      ) : null}

      {/* 상단 플로팅. 컨테이너는 지도 조작을 막지 않고 컨트롤만 탭을 받는다. */}
      <div className="pointer-events-none absolute inset-x-0 top-5 z-20 flex flex-col gap-11 px-4">
        <TextField
          className="pointer-events-auto"
          type="search"
          aria-label="가게 검색"
          placeholder="가게를 검색하세요"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          trailing={<IconSlot size={24} className="text-content-disabled" />}
        />
        {/* items-start가 맞다 — 30px 배지가 48px 버튼과 **위쪽**으로 정렬된다(행 높이는 버튼이 정한다). */}
        <div className="flex items-start justify-between">
          <BadgeMapLocation
            className="pointer-events-auto"
            label={region}
            icon={<IconSlot size={16} />}
          />
          <ButtonCircle
            className="pointer-events-auto"
            variant="stroke"
            state={favoriteOnly ? "pressed" : "normal"}
            // 토글이라 호출부가 aria-pressed를 직접 넘긴다 (button-circle.tsx의 결론).
            aria-pressed={favoriteOnly}
            aria-label="찜한 가게만 보기"
            icon={<IconSlot size={24} />}
            onClick={() => {
              setFavoriteOnly((prev) => !prev);
              setSelectedId(null);
            }}
          />
        </div>
      </div>

      {/* 바텀시트. ⚠️ Figma는 시트(442~844)가 GNB(765~844)를 완전히 덮지만, 여기서는 GNB 위에
          올린다 — GNB는 (tabs)/layout.tsx가 소유하고 이 화면 바깥에 있으며, 시안에 드래그
          핸들이 없어 닫는 길이 X 버튼 하나뿐이라 탭 이동까지 막으면 사용자가 갇힌다.
          감사에서 미결로 남은 항목이다(디자이너 확인 필요). */}
      {selectedStore ? (
        <div className="absolute inset-x-0 bottom-0 z-30">
          <StoreSheet
            store={selectedStore}
            isFavorite={favoriteIds.includes(selectedStore.id)}
            onToggleFavorite={() => toggleFavorite(selectedStore.id)}
            onClose={() => setSelectedId(null)}
          />
        </div>
      ) : null}
    </div>
  );
}
