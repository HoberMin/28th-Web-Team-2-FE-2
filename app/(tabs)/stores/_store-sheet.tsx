"use client";

import { useEffect, useRef } from "react";
import { HeaderStoreDetail } from "../../_components/header-store-detail";
import { RowRecentReport } from "../../_components/row-recent-report";
import { SectionRecentReport } from "../../_components/section-recent-report";
import { SheetStoreDetail } from "../../_components/sheet-store-detail";
import type { MapStore } from "./_data";
import { IconSlot } from "./_icon-slot";

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
//
// ⚠️ 원래 계획은 Radix Dialog(non-modal)로 감싸는 것이었는데 **`@radix-ui/react-dialog`가
//    이 레포에 설치돼 있지 않다.** 의존성 추가는 `package.json`·lockfile을 건드리는 일이라
//    이 작업의 쓰기 범위 밖이고, 지금 다른 화면 agent들과 병렬로 도는 중이라 lockfile 충돌
//    위험도 있다. 그래서 같은 역할을 하는 최소 구현(role=dialog + aria-modal=false +
//    Esc + 포커스 이동/복귀)을 손으로 붙였다. 포커스 **트랩**은 일부러 넣지 않았다 —
//    non-modal 시트라 뒤의 지도·검색이 계속 살아 있어야 하고, 트랩을 손으로 만들면
//    Radix가 공짜로 주는 것보다 잘못될 확률이 높다. Radix 도입 시 이 파일만 갈아끼우면 된다.

/** 야채 그림이 들어갈 자리(40×40). 에셋 다운로드가 정책상 차단돼 있어(figma-bridge §0-0)
 *  `/playground` row/recent-report 스토리와 같은 방식으로 회색 원을 둔다.
 *  ⚠️ 공용 `ImageVegetableOnion`은 기본 크기가 48px이고 `className`으로 40px을 덮으면
 *     클래스 순서가 아니라 생성된 CSS 순서로 승패가 갈려 신뢰할 수 없다(`_lib/cn.ts` 주석).
 *     그래서 여기서는 감싸지 않고 자리표시만 넘긴다. */
function VegetableVisual() {
  return <span className="block size-10 rounded-full bg-surface-secondary" />;
}

/** Figma가 시트 헤더에서 `button/circle`을 오버라이드한 모습 — 회색 배경 36px, 그림자 없음, 20px 아이콘.
 *  우리 공용 `ButtonCircle`(흰 배경 + shadow-floating)과 모양이 달라 여기서 따로 만든다
 *  (`header-store-detail.tsx`의 ⚠️ 주석이 "호출부가 조립한다"고 정한 그 자리다). */
function SheetActionButton({
  label,
  onClick,
  pressed,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary p-2 text-content-primary aria-pressed:text-content-brand-light"
    >
      <IconSlot size={20} />
    </button>
  );
}

export interface StoreSheetProps {
  store: MapStore;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}

export function StoreSheet({ store, isFavorite, onToggleFavorite, onClose }: StoreSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    sheetRef.current?.focus();
    return () => {
      restoreRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="false"
      aria-label={`${store.name} 가게 정보`}
      tabIndex={-1}
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
                  pressed={isFavorite}
                  onClick={onToggleFavorite}
                />
                <SheetActionButton label="가게 정보 닫기" onClick={onClose} />
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
