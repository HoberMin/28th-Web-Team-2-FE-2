import type { Metadata } from "next";
import { INITIAL_FAVORITE_IDS, MAP_REGION, MAP_STORES } from "./_data";
import { StoresMapView } from "./_map-view";

// F03 동네가게 (Figma `화면GUI` 298:3605 · 3617 · 3630 · 3643).
//
// Server Component다 — 이 파일이 하는 일은 데이터를 골라 넘기는 것뿐이고, 화면의 모든
// 인터랙션(마커 선택 · 찜 · 찜 필터 · 검색)은 `_map-view.tsx` 하나에 모여 있다
// (conventions #10 — "use client"는 정말 필요한 leaf에만).
//
// 데이터는 아직 고정 더미(`_data.ts`)라 fetch가 없다. BFF가 붙으면 여기서 서버 fetch를 하고
// 캐싱 의도(revalidate/tags)를 명시한다(conventions #11).
//
// GNB는 여기서 그리지 않는다 — `(tabs)/layout.tsx`가 소유한다.

export const metadata: Metadata = {
  title: "동네 가게",
};

export default function StoresPage() {
  return (
    <StoresMapView
      region={MAP_REGION}
      stores={MAP_STORES}
      initialFavoriteIds={INITIAL_FAVORITE_IDS}
    />
  );
}
