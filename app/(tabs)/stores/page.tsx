import type { Metadata } from "next";
import Link from "next/link";
import { getSelectedRegion } from "@/app/_lib/api/server/selected-region";
import { findRegionCenter, getRegionDisplayName } from "@/app/_lib/region-center";
import { ROUTES } from "@/app/_lib/routes";
import { loadInitialNearbyStores } from "./_initial-nearby";
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

export default async function StoresPage() {
  const region = await getSelectedRegion();
  const center = region ? findRegionCenter(region.regionName) : null;

  if (!region || !center) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center" role="alert">
        <div className="flex max-w-72 flex-col items-center gap-3">
          <p className="text-body-16-semibold text-content-primary">동네 위치를 찾지 못했어요.</p>
          <p className="text-body-14-regular text-content-secondary">
            동네를 다시 선택하면 주변 가게를 보여 드릴게요.
          </p>
          <Link
            href={ROUTES.onboarding}
            className="rounded-lg bg-action-primary-default px-4 py-2 text-body-14-semibold text-content-inverse active:bg-action-primary-pressed"
          >
            동네 다시 선택
          </Link>
        </div>
      </div>
    );
  }

  const initialNearbyState = await loadInitialNearbyStores(center);
  return (
    <StoresMapView
      region={getRegionDisplayName(region.regionName)}
      initialCenter={center}
      initialNearbyState={initialNearbyState}
    />
  );
}
