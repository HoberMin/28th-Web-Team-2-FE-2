"use client";

import { useEffect, useRef, useState, useTransition, type KeyboardEvent, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { HomeVegetableImage } from "@/app/(tabs)/_home/home-vegetable-image";
import { updateStoreFavorite } from "@/app/_lib/api/actions/store-favorite";
import { resolveStoreOpenStatus } from "@/app/_lib/store-open-status";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ButtonCircle } from "../../_components/button-circle";
import { HeaderStoreDetail } from "../../_components/header-store-detail";
import { RowRecentReport } from "../../_components/row-recent-report";
import { SectionRecentReport } from "../../_components/section-recent-report";
import { SheetStoreDetail } from "../../_components/sheet-store-detail";
import { ROUTES } from "@/app/_lib/routes";
import {
  formatStoreDistance,
  formatWalkTime,
  resolveRecentReportDateVariant,
  type MapCenter,
  type MapStore,
} from "./_data";
import { useStoreSheetDetail } from "./_use-store-sheet-detail";

// F03-2 동네 가게 지도의 마커 시트 — Figma `sheet/store-detail`(392-12707)을 그대로 조립한다.
// 이름·주소·전화만 보여 주던 예전 버전은 이 화면 전용 커스텀 마크업이었고, 이미 만들어진
// header/store-detail·section/recent-report 패턴을 쓰지 않고 있었다(2026-08-21 발견).
//
// 영업시간·배지·최근 제보는 지도 목록(`GET /stores/nearby`)에 없는 필드라, 마커를 누른
// 시점에 `GET /api/stores/{storeId}`·`GET /api/stores/{storeId}/reports`를 따로 부른다
// (`_use-store-sheet-detail.ts`). 로딩 중엔 이름만 아는 상태로 스켈레톤을, 실패하면 에러
// 문구를 보여준다 — 상태 3종(로딩/에러/빈) 중 "빈"은 `SectionRecentReport`의 empty state가 맡는다.
//
// ⚠️ "오늘 제보된 품목" 배지: 백엔드는 `totalReportedItemCount`(누적)만 준다 — "오늘" 단위
//    카운트가 없다. 가게 상세 페이지(`_store-detail-client.tsx`)는 이 간극을 "비싼 야채" 수로
//    대체 표시해 정직하게 우회했지만, 이 시트는 Figma 기획 라벨을 유지하기로 했다(사용자 결정,
//    2026-08-21) — 그래서 라벨은 "오늘 제보된 품목" 그대로 두고 숫자만 totalReportedItemCount를 쓴다.
//
// ⚠️ 영업시간(`businessHours`)·영업상태(`openStatus`)는 스펙엔 있지만 카카오 스크래핑
//    (BE PR #229, 2026-08-21 머지)이 아직 라이브 응답을 채우지 않는다 — 계속 빈 배열·"UNKNOWN"이다.
//    그래도 필드 자체는 배선해 둔다 — 백엔드가 채우기 시작하면 화면은 자동으로 반영된다.

export interface StoreSheetProps {
  store: MapStore;
  /** 지도 현재 중심 — 상세 조회의 거리·도보시간 기준(§_use-store-sheet-detail 주석). */
  center: MapCenter;
  onClose: () => void;
  fallbackFocusRef?: RefObject<HTMLElement | null>;
}

export function StoreSheet({ store, center, onClose, fallbackFocusRef }: StoreSheetProps) {
  const router = useRouter();
  const sheetRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const [isFavorite, setIsFavorite] = useState(store.isLiked);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [, startFavoriteTransition] = useTransition();
  const { status, detail, reports, error, fetchedAt } = useStoreSheetDetail(store.id, center);

  // 프로필(이름·주소)은 상세 화면이 `GET /stores/{storeId}`로 직접 조회한다(2026-08-21 신설) —
  // 여기서 실어 보내는 건 그 조회가 실패했을 때의 폴백이고, **전화번호는 상세 응답에 없어서**
  // 지금도 이 쿼리가 유일한 경로다.
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

  const actions = (
    <>
      {/*
        UI QA 2026-08-20 #18·#19 — 찜 상태에 따라 **글리프와 색이 둘 다** 바뀐다.
          미찜: icon/heart-stroke-regular (라인) · content/primary
          찜함: icon/heart-fill (채움) · content/**secondary**(회색)
        Figma `header/store-detail`(392:12144) 실측도 미찜을 heart-stroke-regular로 둔다.
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
          <FigmaIcon name={isFavorite ? "heart-fill" : "heart-stroke-regular"} width={20} currentColor />
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
    </>
  );

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="false"
      aria-label={`${store.name} 가게 정보`}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {favoriteError ? (
        <p role="alert" className="px-4 pt-2 text-body-14-medium text-red-500">
          {favoriteError}
        </p>
      ) : null}

      {status === "loading" ? (
        <div className="flex w-full flex-col items-start gap-2 rounded-t-3xl bg-surface-primary px-4 pt-7 pb-5 shadow-sheet">
          <p className="max-w-57 truncate text-title-20-bold text-content-primary">{store.name}</p>
          <p className="text-body-14-regular text-content-secondary">가게 정보를 불러오고 있어요…</p>
        </div>
      ) : status === "error" ? (
        <div className="flex w-full flex-col items-start gap-4 rounded-t-3xl bg-surface-primary px-4 pt-7 pb-5 shadow-sheet">
          <div className="flex w-full items-center justify-between gap-4">
            <p className="max-w-57 truncate text-title-20-bold text-content-primary">{store.name}</p>
            <div className="flex shrink-0 items-center gap-3">{actions}</div>
          </div>
          <p role="alert" className="text-body-14-regular text-content-secondary">
            {error}
          </p>
        </div>
      ) : (
        <SheetStoreDetail
          header={
            <HeaderStoreDetail
              name={detail?.storeName || store.name}
              openState={resolveStoreOpenStatus(detail?.openStatus)?.label ?? "영업정보 없음"}
              openHours={detail?.businessHours[0] ?? "영업시간 정보 없음"}
              distance={formatStoreDistance(detail?.distance ?? store.distanceMeters) ?? "거리 정보 없음"}
              walkTime={formatWalkTime(detail?.walkTimeMinutes, detail?.distance ?? store.distanceMeters)}
              affordableCount={detail?.cheapItemCount ?? 0}
              todayReportCount={detail?.totalReportedItemCount ?? 0}
              actions={actions}
            />
          }
          onAction={() => router.push(detailHref)}
        >
          {reports && reports.reports.length > 0 ? (
            <SectionRecentReport state="populated">
              {reports.reports.map((report) => (
                <RowRecentReport
                  key={report.reportId}
                  visual={<HomeVegetableImage name={report.itemName} size={40} />}
                  name={report.itemName}
                  reportDate={resolveRecentReportDateVariant(report.reportedDate, fetchedAt ?? 0)}
                  price={`${report.price.toLocaleString("ko-KR")}원`}
                  unit={report.unit ? `/${report.unit}` : ""}
                />
              ))}
            </SectionRecentReport>
          ) : (
            <SectionRecentReport state="empty" />
          )}
        </SheetStoreDetail>
      )}
    </div>
  );
}
