"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import { HeaderStoreDetail } from "../../_components/header-store-detail";
import { RowRecentReport } from "../../_components/row-recent-report";
import { SectionRecentReport } from "../../_components/section-recent-report";
import { SheetStoreDetail } from "../../_components/sheet-store-detail";
import type { MapStore } from "./_data";

// 지도에서 가게를 눌렀을 때 아래에서 올라오는 시트 (Figma 298:3629 / 298:3642).
//
// ── 감사에서 확정된 것들 ─────────────────────────────────────────────
// 🔴 **찜은 제보 목록에 영향을 주지 않는다.** Figma 298:3617과 298:3630은 같은 가게인데
//    찜을 누른 프레임에서 `section/recent-report`가 빈 상태로 바뀌고 양파 제보 2건이 사라진다.
//    데이터상 불가능한 일이라 시안 오류로 판정됐다. 여기서는 제보 목록을 `store.reports`
//    하나에서만 읽는다 — 찜 상태(`isFavorite`)는 하트 버튼의 눌림 표시에만 쓰인다.
// 🔴 **높이를 고정하지 않는다.** Figma의 402 / 362는 snap point가 아니라 위 시안 오류로
//    생긴 콘텐츠 높이 차이다(header 134 · CTA 49 · padding 전부 동일, 제보 구획만 131 vs 91).
//    그래서 스냅도, 고정 높이도 두지 않고 콘텐츠가 높이를 정하게 둔다.
// 🔴 **하단 safe area는 여기서 처리하지 않는다.** 이 시트는 `(tabs)/layout.tsx`의 `<main>`
//    안에 있고, main의 하단 경계는 화면 바닥이 아니라 **GNB 상단**이다. 여기에
//    `env(safe-area-inset-bottom)`을 주면 시트와 GNB 사이에 34px 빈 띠가 생긴다.
//    home indicator를 실제로 마주하는 건 GNB이므로 인셋은 layout이 소유한다.
//
// ── 접근성 ──────────────────────────────────────────────────────────
// 시안에 드래그 핸들(`sheet/handle` 318-15226)이 없어서 닫는 길이 헤더 X 버튼뿐이다.
// 키보드/보조기기 사용자가 갇히지 않도록 **Esc로 닫기 + 열릴 때 시트로 포커스 이동 +
// 닫을 때 원래 자리로 포커스 복귀**를 직접 붙였다.
// 셋 다 범위가 좁다 — Esc는 시트 안에서만 받고(검색 입력의 Esc를 삼키지 않는다), 포커스 복귀는
// 돌아갈 노드가 살아 있고 포커스가 body로 떨어졌을 때만 한다. 근거는 아래 두 🔴 주석.
//
// ⚠️ 원래 계획은 Radix Dialog(non-modal)로 감싸는 것이었는데 **`@radix-ui/react-dialog`가
//    이 레포에 설치돼 있지 않다.** 의존성 추가는 `package.json`·lockfile을 건드리는 일이라
//    이 작업의 쓰기 범위 밖이고, 지금 다른 화면 agent들과 병렬로 도는 중이라 lockfile 충돌
//    위험도 있다. 그래서 같은 역할을 하는 최소 구현(role=dialog + aria-modal=false +
//    Esc + 포커스 이동/복귀)을 손으로 붙였다. 포커스 **트랩**은 일부러 넣지 않았다 —
//    non-modal 시트라 뒤의 지도·검색이 계속 살아 있어야 하고, 트랩을 손으로 만들면
//    Radix가 공짜로 주는 것보다 잘못될 확률이 높다. Radix 도입 시 이 파일만 갈아끼우면 된다.

/** 제보 행의 야채 그림(40×40). `/playground` row/recent-report·sheet/store-detail 스토리와
 *  같은 방식으로 Figma 원본 PNG를 그대로 쓴다.
 *
 *  ⚠️ 지금 export된 야채 그림은 **양파 하나뿐**이라 품목과 무관하게 같은 그림이 나온다.
 *     품목별 그림이 올라오면 `report.name`으로 고르게 바꾼다(디자이너 대기 항목).
 *  ⚠️ 공용 `ImageVegetableOnion`은 기본 크기가 48px이고 `className`으로 40px을 덮으면
 *     클래스 순서가 아니라 생성된 CSS 순서로 승패가 갈려 신뢰할 수 없다(`_lib/cn.ts` 주석).
 *     그래서 감싸지 않고 40px로 직접 넘긴다.
 *  alt는 빈 값이 맞다 — 바로 옆에 야채 이름이 텍스트로 있어 그림은 장식이다. */
function VegetableVisual() {
  return <FigmaImage name="onion.png" width={40} height={40} className="size-10 object-contain" />;
}

/** Figma가 시트 헤더에서 `button/circle`을 오버라이드한 모습 — 회색 배경 36px, 그림자 없음, 20px 아이콘.
 *  우리 공용 `ButtonCircle`(흰 배경 + shadow-floating)과 모양이 달라 여기서 따로 만든다
 *  (`header-store-detail.tsx`의 ⚠️ 주석이 "호출부가 조립한다"고 정한 그 자리다).
 *  `button/circle` 세트(477-5182)에 "회색 배경 + 그림자 없음" 조합이 없어서 생긴 자리라
 *  variant 추가는 디자이너 결정 사항이다 — 여기서 임의로 만들지 않는다.
 *
 *  아이콘 색: Figma 실측(298:3629 미찜 / 298:3642 찜)에서 두 상태 모두 **#697383
 *  (= gray/600 = content/secondary)**이다. 상태를 나르는 건 색이 아니라 글리프(외곽선↔채움)라
 *  색은 고정하고 글리프만 바꾼다. 대비 4.33:1 on surface/secondary → 아이콘 기준 3:1 통과. */
function SheetActionButton({
  label,
  icon,
  onClick,
  pressed,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary p-2 text-content-secondary"
    >
      {icon}
    </button>
  );
}

export interface StoreSheetProps {
  store: MapStore;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
  /** 돌아갈 자리(마커)가 사라졌을 때 포커스가 착지할 대비 지점. 아래 🔴 참고. */
  fallbackFocusRef?: RefObject<HTMLElement | null>;
}

export function StoreSheet({
  store,
  isFavorite,
  onToggleFavorite,
  onClose,
  fallbackFocusRef,
}: StoreSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const fallback = fallbackFocusRef?.current ?? null;
    sheetRef.current?.focus();

    return () => {
      const restore = restoreRef.current;

      // 🔴 시트를 연 마커가 **사라지면서** 시트가 닫히는 경로가 있다(시트 안에서 찜을 풀어
      //    찜 필터에서 걸러지는 경우 등). 그때 `restore`는 이미 DOM에서 빠진 노드라
      //    `.focus()`가 아무 일도 하지 않고 포커스가 body로 떨어진다 — 키보드 사용자는
      //    문서 맨 앞으로 튕긴다. 그래서 살아 있는지 확인하고, 죽었으면 지도 영역으로 보낸다.
      //
      //    rAF로 미루는 이유: 이 정리 함수는 DOM 제거가 끝나기 전에 돌 수 있어서 그 시점의
      //    `isConnected`는 아직 true일 수 있다. 다음 프레임이면 제거가 확정돼 판단이 정확하다.
      //
      //    포커스가 이미 다른 컨트롤(검색 필드·찜 필터 버튼)에 있으면 **뺏지 않는다** —
      //    그 컨트롤을 조작해서 시트가 닫힌 경우라 원래 자리가 맞다. 시트가 포커스를 들고
      //    있었을 때만 body로 떨어지므로, body인지로 구분한다.
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (active && active !== document.body) return;
        if (restore?.isConnected) restore.focus();
        else fallback?.focus();
      });
    };
  }, [fallbackFocusRef]);

  // 🔴 Esc는 **시트 안에 포커스가 있을 때만** 받는다. 예전엔 `document`에 리스너를 걸어서
  //    지도 위 검색 입력에 글자를 지우려고 Esc를 눌러도 시트가 닫혔다(입력에서 Esc는 관례상
  //    입력을 지우는 키다). React의 keydown은 시트 하위에서만 올라오므로 범위가 정확히 맞는다.
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
      className="rounded-t-3xl bg-surface-primary"
    >
      <SheetStoreDetail
        header={
          <HeaderStoreDetail
            name={store.name}
            openState={store.openState}
            openHours={store.openHours}
            distance={store.distance}
            walkTime={store.walkTime}
            affordableCount={store.affordableCount}
            todayReportCount={store.todayReportCount}
            actions={
              <>
                <SheetActionButton
                  label={isFavorite ? `${store.name} 찜 해제` : `${store.name} 찜하기`}
                  icon={
                    isFavorite ? (
                      // ⚠️ 20px 헤더용 **채움** 하트는 export된 에셋에 없다(외곽선만
                      //    `heart-stroke-header-20`으로 있다). 같은 글리프의 24px 채움본을
                      //    20px로 줄여 쓴다 — currentColor라 색은 헤더 색(#697383)을 따른다.
                      //    디자이너에게 `heart-fill-header-20` 요청 대기 항목.
                      <FigmaIcon name="heart-fill" width={20} currentColor />
                    ) : (
                      <FigmaIcon name="heart-stroke-header-20" width={20} currentColor />
                    )
                  }
                  pressed={isFavorite}
                  onClick={onToggleFavorite}
                />
                <SheetActionButton
                  label="가게 정보 닫기"
                  icon={<FigmaIcon name="close-header-20" width={20} currentColor />}
                  onClick={onClose}
                />
              </>
            }
          />
        }
      >
        {/* 제보 목록은 `store.reports` 하나에서만 온다 — 찜 상태와 무관하다(위 🔴 참고). */}
        <SectionRecentReport state={store.reports.length > 0 ? "populated" : "empty"}>
          {store.reports.map((report) => (
            <RowRecentReport
              key={report.id}
              visual={<VegetableVisual />}
              name={report.name}
              reportDate={report.date}
              price={report.price}
              unit={report.unit}
            />
          ))}
        </SectionRecentReport>
      </SheetStoreDetail>
    </div>
  );
}
