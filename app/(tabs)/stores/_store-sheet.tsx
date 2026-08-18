"use client";

import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { formatStoreDistance, type MapStore } from "./_data";

export interface StoreSheetProps {
  store: MapStore;
  onClose: () => void;
  fallbackFocusRef?: RefObject<HTMLElement | null>;
}

export function StoreSheet({ store, onClose, fallbackFocusRef }: StoreSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const distance = formatStoreDistance(store.distanceMeters);

  useEffect(() => {
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const fallback = fallbackFocusRef?.current ?? null;
    sheetRef.current?.focus();

    return () => {
      const restore = restoreRef.current;
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (active && active !== document.body) return;
        if (restore?.isConnected) restore.focus();
        else fallback?.focus();
      });
    };
  }, [fallbackFocusRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    onClose();
  };

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="false"
      aria-label={`${store.name} 가게 정보`}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="flex w-full flex-col gap-5 rounded-t-3xl bg-surface-primary px-4 pt-7 pb-5 shadow-sheet"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-title-20-bold text-content-primary">{store.name}</h2>
            {store.isLiked ? (
              <span className="rounded-md bg-surface-brand px-2 py-1 text-caption-12-semibold text-content-brand-dark">
                찜한 가게
              </span>
            ) : null}
          </div>
          <dl className="mt-3 flex flex-col gap-2 text-body-14-regular">
            <div>
              <dt className="sr-only">주소</dt>
              <dd className="text-content-primary">{store.address ?? "주소 정보 없음"}</dd>
            </div>
            <div>
              <dt className="sr-only">전화</dt>
              <dd className="text-content-secondary">
                {store.phone ? <a href={`tel:${store.phone}`}>{store.phone}</a> : "전화 정보 없음"}
              </dd>
            </div>
            <div>
              <dt className="sr-only">거리</dt>
              <dd className="text-content-secondary">{distance ?? "거리 정보 없음"}</dd>
            </div>
          </dl>
        </div>
        <button
          type="button"
          aria-label="가게 정보 닫기"
          onClick={onClose}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-content-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-surface-secondary p-2">
            <FigmaIcon name="close-header-20" width={20} currentColor />
          </span>
        </button>
      </div>
    </div>
  );
}
