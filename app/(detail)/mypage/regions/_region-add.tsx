"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RowSortOption } from "@/app/_components/row-sort-option";
import { TextField } from "@/app/_components/text-field";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import {
  useNearbyRegionOptions,
  useRegionSearchOptions,
} from "@/app/onboarding/steps/use-region-options";
import { addRegionAction } from "./_actions";

// 동네 추가. 온보딩 지역 선택 화면이 쓰는 검색/근처 동네 훅을 그대로 재사용한다(복제 안 함) —
// 검색어가 있으면 검색 결과, 없으면 근처 동네를 보여준다. 행 표시는 목록 섹션(`_region-list`)과
// 같은 `row/sort-option` current 축으로 맞춰 화면 톤을 통일했다.
//
// 이미 등록된 동네(409)는 실패로 취급하지 않는다 — 온보딩의 `registerCurrentRegionAPI`와 같은
// 판단이지만, 여기서는 자동으로 현재 동네로 바꾸지 않으므로 "이미 등록된 동네예요"로만 안내한다.

interface Feedback {
  regionId: string;
  message: string;
}

export function RegionAdd() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pendingRegionId, setPendingRegionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [, startTransition] = useTransition();

  const searchState = useRegionSearchOptions(query);
  const nearbyState = useNearbyRegionOptions();
  const isSearching = query.trim().length > 0;
  const optionsState = isSearching ? searchState : nearbyState;

  function handleAdd(regionId: string) {
    setFeedback(null);
    setPendingRegionId(regionId);
    startTransition(async () => {
      const result = await addRegionAction(regionId);
      setPendingRegionId(null);
      if (result.ok) {
        router.refresh();
        return;
      }
      setFeedback({ regionId, message: result.message });
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="sr-only" htmlFor="mypage-region-search">
        동 단위로 지역 검색
      </label>
      <TextField
        id="mypage-region-search"
        name="mypage-region-search"
        type="text"
        inputMode="search"
        value={query}
        autoComplete="address-level3"
        placeholder="동 단위로 검색"
        trailing={
          query ? (
            <button
              type="button"
              aria-label="검색어 지우기"
              className="flex size-6 items-center justify-center"
              onClick={() => {
                setQuery("");
                setFeedback(null);
              }}
            >
              <FigmaIcon name="close-fill" width={24} />
            </button>
          ) : (
            <span className="flex size-6 items-center justify-center text-content-secondary">
              <FigmaIcon name="search" width={24} currentColor />
            </span>
          )
        }
        onChange={(event) => {
          setQuery(event.target.value);
          setFeedback(null);
        }}
      />

      <p className="px-2 text-body-14-medium text-content-secondary">
        {isSearching ? "검색 결과" : "근처 동네"}
      </p>

      {optionsState.status === "success" ? (
        <ul>
          {optionsState.regions.map((region) => {
            const isPendingRow = pendingRegionId === region.regionId;
            return (
              <li key={region.regionId}>
                <RowSortOption
                  current
                  label={region.regionName}
                  disabled={pendingRegionId !== null}
                  onClick={() => handleAdd(region.regionId)}
                  badge={
                    <span className="shrink-0 text-caption-12-medium text-content-brand-medium">
                      {isPendingRow ? "추가 중" : "추가"}
                    </span>
                  }
                />
                {feedback?.regionId === region.regionId ? (
                  <p role="status" className="px-2 pb-2 text-caption-12-medium text-content-secondary">
                    {feedback.message}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p
          className="px-2 py-6 text-center text-body-14-medium text-content-secondary"
          role={optionsState.status === "error" ? "alert" : "status"}
        >
          {optionsState.message}
        </p>
      )}
    </div>
  );
}
