import type { Metadata } from "next";
import { MAP_REGION } from "./_data";
import { StoresMapView } from "./_map-view";

// F03 동네가게 (Figma `화면GUI` 298:3605 · 3617 · 3630 · 3643).
//
// Server Component다 — 이 파일은 화면 껍데기만 고르고, 화면의 모든 인터랙션
// (지도 이동 · 마커 선택 · 찜 필터 · 검색)은 `_map-view.tsx` 하나에 모여 있다
// (conventions #10 — "use client"는 정말 필요한 leaf에만).
// 지도 중심이 브라우저에서 계속 바뀌므로 가게 목록은 Client leaf가 same-origin BFF로 조회한다.
//
// GNB는 여기서 그리지 않는다 — `(tabs)/layout.tsx`가 소유한다.

export const metadata: Metadata = {
  title: "동네 가게",
};

export default function StoresPage() {
  return <StoresMapView region={MAP_REGION} />;
}
