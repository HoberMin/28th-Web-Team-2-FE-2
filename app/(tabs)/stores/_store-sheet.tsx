"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import Link from "next/link";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ButtonCircle } from "../../_components/button-circle";
import { ROUTES } from "@/app/_lib/routes";
import { formatStoreDistance, type MapStore } from "./_data";

export interface StoreSheetProps {
  store: MapStore;
  onClose: () => void;
  fallbackFocusRef?: RefObject<HTMLElement | null>;
}

export function StoreSheet({ store, onClose, fallbackFocusRef }: StoreSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const [isFavorite, setIsFavorite] = useState(store.isLiked);
  const distance = formatStoreDistance(store.distanceMeters);
  const detailQuery = new URLSearchParams({
    backendStoreId: store.id,
    name: store.name,
  });
  if (store.address) detailQuery.set("address", store.address);
  if (store.phone) detailQuery.set("phone", store.phone);
  const detailHref = `${ROUTES.storeDetail("temporary")}?${detailQuery.toString()}`;

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
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="max-w-57 truncate text-title-20-bold text-content-primary">{store.name}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <ButtonCircle
              variant="fill"
              state={isFavorite ? "pressed" : "normal"}
              size={36}
              className="bg-surface-secondary shadow-none"
              aria-label={isFavorite ? "찜한 가게 해제" : "가게 찜하기"}
              aria-pressed={isFavorite}
              icon={<FigmaIcon name="heart-fill" width={20} currentColor />}
              onClick={() => setIsFavorite((current) => !current)}
            />
            <ButtonCircle
              variant="fill"
              size={36}
              className="bg-surface-secondary shadow-none"
              aria-label="가게 정보 닫기"
              icon={<FigmaIcon name="close-header-20" width={20} />}
              onClick={onClose}
            />
          </div>
        </div>
        <div className="min-w-0">
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
      </div>
      <Link
        href={detailHref}
        className="relative inline-flex w-full items-center justify-center rounded-lg bg-action-secondary-default px-7 py-3 text-body-16-semibold text-content-inverse active:bg-content-secondary"
        aria-label="가게 상세 보기"
      >
        가게 상세 보기
      </Link>
    </div>
  );
}
