"use client";

import { type FormEvent, type PointerEvent, useState } from "react";
import { Button } from "@/app/_components/button";
import { TextField } from "@/app/_components/text-field";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { regionsByProximity, searchRegions, type Region } from "@/app/_lib/regions";
import { DEFAULT_DISTRICT } from "@/app/_lib/vegetables";

const RECOMMENDATION_COUNT = 5;
const NEARBY_REGIONS = regionsByProximity(DEFAULT_DISTRICT, RECOMMENDATION_COUNT);

interface RegionStepProps {
  defaultValue: string;
  onComplete: (district: string) => void;
}

interface RegionRowProps {
  current: boolean;
  region: Region;
  selected: boolean;
  onSelect: (region: Region) => void;
}

function RegionRow({ current, region, selected, onSelect }: RegionRowProps) {
  return (
    <li>
      <button
        type="button"
        className="flex h-12.25 w-full items-center justify-between gap-3 text-left"
        aria-pressed={selected}
        onClick={() => onSelect(region)}
      >
        <span
          className={`min-w-0 truncate ${
            selected
              ? "text-body-16-bold text-content-primary"
              : "text-body-16-medium text-content-secondary"
          }`}
        >
          {region.label}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {current ? (
            <span className="rounded-sm bg-surface-brand px-2 py-0.5 text-body-12-semibold text-content-brand-medium">
              현재 위치
            </span>
          ) : null}
          {selected ? (
            <span className="text-content-brand-light">
              <FigmaIcon name="check" width={20} currentColor />
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

export function RegionStep({ defaultValue, onComplete }: RegionStepProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(defaultValue);
  const isSearching = query.trim().length > 0;
  const visibleRegions = isSearching ? searchRegions(query).slice(0, 30) : NEARBY_REGIONS;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    onComplete(selected);
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
            className="mt-6.5"
            trailing={
              query ? (
                <button
                  type="button"
                  aria-label="검색어 지우기"
                  className="flex size-6 items-center justify-center text-content-secondary"
                  onClick={() => setQuery("")}
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
              setSelected("");
            }}
          />
        </div>

        <div className="mt-5.5 h-px shrink-0 bg-border-primary" />

        <section className="min-h-0 flex-1 overflow-y-auto px-4 overscroll-y-contain">
          <h2 className="flex h-14.75 items-center text-body-14-semibold text-content-secondary">
            {isSearching ? "검색 결과" : "근처 동네"}
          </h2>

          {visibleRegions.length > 0 ? (
            <ul>
              {visibleRegions.map((region) => (
                <RegionRow
                  key={region.id}
                  region={region}
                  current={!isSearching && Boolean(defaultValue) && region.label === defaultValue}
                  selected={region.label === selected}
                  onSelect={(next) => setSelected(next.label)}
                />
              ))}
            </ul>
          ) : (
            <p className="py-12 text-center text-body-16-medium text-content-secondary">
              검색 결과가 없어요
            </p>
          )}
        </section>

        <footer className="shrink-0 bg-surface-primary px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
          <Button
            type="submit"
            className="h-12.25 w-full"
            disabled={!selected}
            leading={false}
            trailing={false}
          >
            확인
          </Button>
        </footer>
      </form>
    </main>
  );
}
