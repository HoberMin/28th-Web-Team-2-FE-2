"use client";

import { type FormEvent, type PointerEvent, useState } from "react";
import { Button } from "@/app/_components/button";
import { RowSortOption } from "@/app/_components/row-sort-option";
import { TextField } from "@/app/_components/text-field";
import type { Region } from "@/app/_lib/api/schemas/regions";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import {
  type RegionOptionsState,
  useNearbyRegionOptions,
  useRegionSearchOptions,
} from "./use-region-options";

interface RegionStepProps {
  defaultValue: Region | null;
  onComplete: (region: Region) => Promise<void>;
}

interface RegionRowProps {
  currentLocation: boolean;
  region: Region;
  selected: boolean;
  onSelect: (region: Region) => void;
}

// Figma는 이 행을 `row/sort-option` 인스턴스로 꽂아 둔다(429:17770~17774, 358×49).
//
// 2026-08-19 재확인 — **디자이너가 축을 늘려서 해결했다.** 마스터(318-14915)의 state 축이
// normal·selected(높이 58) 2개에서 **current(831-35690)·current-selected(836-12227) 2개가
// 추가된 4개**로 늘었고, 그 두 변형이 정확히 이 화면의 py-12 · 테두리 없음 · 높이 49다.
// 화면 인스턴스도 실제로 이 두 변형에 물려 있다(`I429:17770;836:12228` 등).
// 그래서 "규격이 8px 어긋나서 로컬로 둔다"는 근거가 사라졌고 공통 컴포넌트로 되돌린다.
//
// ⚠️ `current`는 "현재 위치"가 아니라 **높이 49 축**이다(마스터 머리말 참고). 그래서 이 화면은
//    5행 전부 `current`를 켜고, 사용자의 현재 위치 행만 `badge`를 추가로 넘긴다.
function RegionRow({ currentLocation, region, selected, onSelect }: RegionRowProps) {
  return (
    <li>
      <RowSortOption
        current
        label={region.regionName}
        selected={selected}
        onClick={() => onSelect(region)}
        badge={currentLocation ? <CurrentLocationBadge /> : undefined}
        checkIcon={<FigmaIcon name="check" width={20} currentColor />}
      />
    </li>
  );
}

// Figma `badge/current-location`(마스터 836:11892) 실측: surface/brand · radius/sm 4 ·
// px-8 py-2 · **caption/12-semibold** · content/brand/medium.
// 라이브러리 컴포넌트지만 아직 쓰는 곳이 이 화면 하나뿐이라 `app/_components/`로 올리지 않았다.
function CurrentLocationBadge() {
  return (
    <span className="shrink-0 rounded-sm bg-surface-brand px-2 py-0.5 text-caption-12-semibold text-content-brand-medium">
      현재 위치
    </span>
  );
}

function RegionStateMessage({ state }: { state: RegionOptionsState }) {
  if (!state.message) return null;
  return (
    <p
      className="px-4 py-12 text-center text-body-16-medium text-content-secondary"
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

export function RegionStep({ defaultValue, onComplete }: RegionStepProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Region | null>(defaultValue);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const searchState = useRegionSearchOptions(query);
  const nearbyState = useNearbyRegionOptions();
  const isSearching = query.trim().length > 0;
  const optionsState = isSearching ? searchState : nearbyState;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || isSaving) return;

    setIsSaving(true);
    setSaveError("");
    try {
      await onComplete(selected);
    } catch {
      setSaveError("동네를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setIsSaving(false);
    }
  }

  function handleBackgroundPointerDown(event: PointerEvent<HTMLFormElement>) {
    if (!(event.target instanceof Element) || event.target.closest("input, button")) return;
    (document.activeElement as HTMLElement | null)?.blur();
  }

  return (
    <main className="min-h-dvh bg-surface-secondary">
      <form
        className="mx-auto flex h-dvh w-full max-w-97.5 flex-col overflow-hidden bg-surface-primary"
        onSubmit={handleSubmit}
        onPointerDown={handleBackgroundPointerDown}
      >
        {/* iOS 상태바가 viewport 위쪽 44px을 차지하므로, Figma의 region-body top 84px에
            맞추려면 콘텐츠 여백은 40px이어야 한다. 기존 pt-21은 상태바와 중복되어
            제목이 아래로 밀렸다. */}
        <div className="shrink-0 px-4 pt-10">
          <h1 className="text-title-24-semibold text-content-primary">
            평소 어디에서
            <br />
            야채를 구매하나요?
          </h1>

          <label className="sr-only" htmlFor="region-search">
            동 단위로 지역 검색
          </label>
          <TextField
            id="region-search"
            name="region-search"
            type="text"
            inputMode="search"
            value={query}
            autoComplete="address-level3"
            placeholder="동 단위로 검색"
            // Figma 364:8016 `region-body-search` = flex-col **gap-[28px]** (제목 h70 + 28 = 필드 y98).
            className="mt-7"
            trailing={
              query ? (
                <button
                  type="button"
                  aria-label="검색어 지우기"
                  className="flex size-6 items-center justify-center"
                  onClick={() => {
                    setQuery("");
                    setSelected(null);
                  }}
                >
                  {/*
                    UI QA 2026-08-20 #5 "검색 필드 X아이콘 크기가 작고, X가 안적혀있음".
                    `close-fill.svg`는 회색 원(#697383) + 흰 X(#F9F9FB) **2색**인데
                    `currentColor` 마스크로 그리면 알파만 쓰이므로 X 획이 원과 같은 색이 되어
                    사라진다. 원본 색 그대로 렌더해 두 색을 살린다.
                    (같은 파일의 `(tabs)/prices/_search-field.tsx`는 원래부터 이렇게 쓰고 있었다)
                  */}
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
              setSelected(null);
              setSaveError("");
            }}
          />
        </div>

        {/*
          Figma 364:8015 `region-body` = flex-col **gap-[20px]** — 검색 블록과 결과 블록 사이.
          구분선은 별도 레이어가 아니라 결과 제목(364:8020)의 **border-t**다. 그래서 독립
          divider를 없애고 제목에 테두리를 붙였다. 테두리는 화면 폭 전체(390)를 지나가고
          제목 텍스트만 px-16이라, section에서 px-4를 떼고 자식에 각각 붙인다.
        */}
        <section className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {/* Figma 364:8020 실측: border-t border/primary · **pt-[20px] pb-[16px]** · body/14-**medium** */}
          <h2 className="border-t border-border-primary px-4 pb-4 pt-5 text-body-14-medium text-content-secondary">
            {isSearching ? "검색 결과" : "근처 동네"}
          </h2>

          {optionsState.status === "success" ? (
            <ul className="px-4">
              {optionsState.regions.map((region, index) => (
                <RegionRow
                  key={region.regionId}
                  region={region}
                  currentLocation={!isSearching && index === 0}
                  selected={region.regionId === selected?.regionId}
                  onSelect={(next) => {
                    setSelected((current) =>
                      current?.regionId === next.regionId ? null : next,
                    );
                    setSaveError("");
                  }}
                />
              ))}
            </ul>
          ) : (
            <RegionStateMessage state={optionsState} />
          )}
          {saveError ? (
            <p className="px-4 py-3 text-center text-body-14-medium text-content-error" role="alert">
              {saveError}
            </p>
          ) : null}
        </section>

        <footer className="h-20.25 shrink-0 bg-surface-primary px-5 pb-6 pt-2">
          <Button
            type="submit"
            className="h-12.25 w-full"
            disabled={!selected || isSaving}
            aria-busy={isSaving}
            leading={false}
            trailing={false}
          >
            {isSaving ? "저장 중" : "확인"}
          </Button>
        </footer>
      </form>
    </main>
  );
}
