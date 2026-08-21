"use client";

import { useEffect, useRef, useState, useTransition, type KeyboardEvent, type RefObject } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateStoreFavorite } from "@/app/_lib/api/actions/store-favorite";
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
  const router = useRouter();
  const sheetRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const [isFavorite, setIsFavorite] = useState(store.isLiked);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [, startFavoriteTransition] = useTransition();
  const distance = formatStoreDistance(store.distanceMeters);
  // 프로필(이름·주소)은 상세 화면이 `GET /stores/{storeId}`로 직접 조회한다(2026-08-21 신설) —
  // 여기서 실어 보내는 건 그 조회가 실패했을 때의 폴백이고, **전화번호는 상세 응답에 없어서**
  // 지금도 이 쿼리가 유일한 경로다.
  // 경로는 **Spring의 숫자 storeId**다 — 예전의 `/stores/temporary?backendStoreId=…`는
  // 제보 목록 API가 붙으면서 없어졌다(2026-08-20).
  const detailQuery = new URLSearchParams({ name: store.name });
  if (store.address) detailQuery.set("address", store.address);
  if (store.phone) detailQuery.set("phone", store.phone);
  if (isFavorite) detailQuery.set("liked", "1");
  const detailHref = `${ROUTES.storeDetail(store.id)}?${detailQuery.toString()}`;

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

  // 단골 등록/해제는 `PUT|DELETE /api/v1/stores/{storeId}/favorite`. 낙관적으로 먼저
  // 뒤집고 실패하면 되돌린다. 성공 뒤 refresh로 지도 마커의 찜 상태까지 다시 받는다.
  const handleToggleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    setFavoriteError(null);

    startFavoriteTransition(async () => {
      const result = await updateStoreFavorite(Number(store.id), next);
      if (result.status === "success") {
        router.refresh();
        return;
      }
      setIsFavorite(!next);
      setFavoriteError(result.message);
    });
  };

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
      {favoriteError ? (
        <p role="alert" className="text-body-14-medium text-red-500">
          {favoriteError}
        </p>
      ) : null}
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="max-w-57 truncate text-title-20-bold text-content-primary">{store.name}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {/*
              UI QA 2026-08-20 #18·#19 — 찜 상태에 따라 **글리프와 색이 둘 다** 바뀐다.
                미찜: icon/heart-stroke-regular (라인) · content/primary
                찜함: icon/heart-fill (채움) · content/**secondary**(회색)
              그전에는 두 상태 모두 heart-fill이라 "안 눌러도 채워져 있고"(#18),
              눌렀을 때는 ButtonCircle의 `state="pressed"`가 content/brand/light를 입혀
              "초록으로 채워졌다"(#19).
              Figma `header/store-detail`(392:12144) 실측도 미찜을 heart-stroke-regular로 둔다.

              ⚠️ 2026-08-21 재수정 — 08-20에는 `className`으로 배경·그림자·색을 덮었는데,
                 `cn`이 tailwind-merge가 아니라 승자가 `@theme` 순서로 정해지고, 특히
                 ButtonCircle의 `active:text-content-brand-light`가 항상 늦게 적용돼
                 **누르는 동안(iOS는 다음 터치까지) 초록으로 되돌아갔다.**
                 → 클래스 덮어쓰기 대신 `surface`·`elevated`·`inheritColor` prop으로
                   충돌하는 클래스를 아예 emit하지 않게 바꿨다.
            */}
            <ButtonCircle
              variant={isFavorite ? "fill" : "stroke"}
              size={36}
              surface="secondary"
              elevated={false}
              inheritColor
              className={isFavorite ? "text-content-secondary" : "text-content-primary"}
              aria-label={isFavorite ? "찜한 가게 해제" : "가게 찜하기"}
              aria-pressed={isFavorite}
              icon={
                <FigmaIcon
                  name={isFavorite ? "heart-fill" : "heart-stroke-regular"}
                  width={20}
                  currentColor
                />
              }
              onClick={handleToggleFavorite}
            />
            <ButtonCircle
              variant="fill"
              size={36}
              surface="secondary"
              elevated={false}
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
