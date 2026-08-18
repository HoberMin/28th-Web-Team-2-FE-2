"use client";

import { type FormEvent, type PointerEvent, useState } from "react";
import { Button } from "@/app/_components/button";
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
  current: boolean;
  region: Region;
  selected: boolean;
  onSelect: (region: Region) => void;
}

// Figma는 이 행을 `row/sort-option` 인스턴스로 꽂아 두었지만(364:8023~8027) **라이브러리
// 마스터와 규격이 다르다** — 마스터(318-14915, 레포 `app/_components/row-sort-option.tsx`)는
// `py-[16px]` + `border-b border/secondary`라 높이 57인데, 온보딩 인스턴스는 `py-[12px]` +
// **테두리 없음**이라 높이 **49**다. 그래서 공통 컴포넌트를 재사용하지 않고 로컬로 둔다 —
// 재사용하면 px가 8 틀어진다. (GUI피드백.md에 기록: 같은 컴포넌트 이름이 49/57/58 세 규격을 덮는다)
function RegionRow({ current, region, selected, onSelect }: RegionRowProps) {
  return (
    <li>
      <button
        type="button"
        className="flex h-12.25 w-full items-center justify-between text-left"
        aria-pressed={selected}
        onClick={() => onSelect(region)}
      >
        <span className="flex min-w-0 items-center gap-1">
          <span
            className={`truncate ${
              selected ? "text-body-16-bold" : "text-body-16-medium"
            } text-content-primary`}
          >
            {region.regionName}
          </span>
          {current ? (
            // Figma `badge/current-location` 364:6171 실측: surface/brand · radius/sm 4 ·
            // px-8 py-2 · **caption/12-semibold** · content/brand/medium.
            // (기존 `text-body-12-semibold`는 @theme에 없는 토큰이라 무효 클래스였다)
            <span className="rounded-sm bg-surface-brand px-2 py-0.5 text-caption-12-semibold text-content-brand-medium">
              현재 위치
            </span>
          ) : null}
        </span>
        {selected ? (
          <span className="shrink-0 text-content-brand-light">
            <FigmaIcon name="check" width={20} currentColor />
          </span>
        ) : null}
      </button>
    </li>
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
        <div className="shrink-0 px-4 pt-21">
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
                  className="flex size-6 items-center justify-center text-content-secondary"
                  onClick={() => {
                    setQuery("");
                    setSelected(null);
                  }}
                >
                  <FigmaIcon name="close-fill" width={20} currentColor />
                </button>
              ) : (
                <span className="text-content-secondary">
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
                  current={!isSearching && index === 0}
                  selected={region.regionId === selected?.regionId}
                  onSelect={(next) => {
                    setSelected(next);
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
