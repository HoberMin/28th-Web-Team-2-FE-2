"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RowSortOption } from "@/app/_components/row-sort-option";
import type { UserRegion } from "@/app/_lib/api/schemas/regions";
import { switchCurrentRegionAction } from "./_actions";

// 등록된 동네 목록. 온보딩 지역 선택과 같은 `row/sort-option`의 `current` 축(49px·테두리
// 없음)을 그대로 쓴다. 현재 동네 행은 배지만 붙이고 클릭을 막는다(이미 현재라 전환할 게
// 없다) — 나머지 행은 클릭하면 그 동네로 전환한다.

interface RegionListProps {
  regions: UserRegion[];
}

// Figma `badge/current-location`(마스터 836:11892)과 같은 시각 — 온보딩 `CurrentLocationBadge`
// 참고. 텍스트만 다르다. 쓰는 곳이 여기 하나뿐이라 공용 컴포넌트로 올리지 않았다.
function CurrentRegionBadge() {
  return (
    <span className="shrink-0 rounded-sm bg-surface-brand px-2 py-0.5 text-caption-12-semibold text-content-brand-medium">
      현재 동네
    </span>
  );
}

export function RegionList({ regions }: RegionListProps) {
  const router = useRouter();
  const [pendingRegionId, setPendingRegionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleSwitch(regionId: string, regionName: string) {
    setMessage(null);
    setPendingRegionId(regionId);
    startTransition(async () => {
      const result = await switchCurrentRegionAction(regionId, regionName);
      setPendingRegionId(null);
      if (result.ok) {
        router.refresh();
        return;
      }
      setMessage(result.message);
    });
  }

  return (
    <div className="flex flex-col">
      <ul>
        {regions.map((region) => (
          <li key={region.regionId}>
            <RowSortOption
              current
              label={region.regionName}
              aria-current={region.isCurrent || undefined}
              disabled={region.isCurrent || pendingRegionId !== null}
              badge={region.isCurrent ? <CurrentRegionBadge /> : undefined}
              onClick={
                region.isCurrent
                  ? undefined
                  : () => handleSwitch(region.regionId, region.regionName)
              }
            />
          </li>
        ))}
      </ul>
      {message ? (
        <p role="alert" className="px-2 pt-2 text-body-14-medium text-content-error">
          {message}
        </p>
      ) : null}
    </div>
  );
}
