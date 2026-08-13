import Link from "next/link";
import type { Metadata } from "next";
import { MarkerStoreMap } from "@/app/_components/marker-store-map";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import { ROUTES } from "@/app/_lib/routes";
import { ReportHeader } from "../_components/report-header";
import { RowStoreOption } from "../_components/row-store-option";
import { getReportPlaces } from "../_data";

// F04-3 판매 장소 선택 — Figma 화면GUI(원본) 364:8293.
//
// **Server Component다.** 지도 placeholder·마커·행이 전부 정적이라 클라이언트 지시어가 없다.
//
// get_design_context + get_screenshot 실측:
//   header       `header/vegetable-detail` 364:8294 — **icon/close 24 + 제목 없음**
//                (다른 제보 화면은 chevron-left + 제목이 있다)
//   제목         364:8295 · x16 y120 · **title/20-semibold** · content/primary · 2줄
//                "야채 가격을 확인한 / 장소를 선택해 주세요"
//                → 헤더 bottom 93 기준 위 여백 **27** (F04-1은 28, F04-2는 13 — 셋이 다 다르다)
//   map-sheet    y195 h649 — 내용을 **클립한다**. 안의 map-placeholder가 y-92.9 h786으로
//                위로 넘치는데 화면에서는 195부터 보인다(스크린샷으로 확인).
//   마커         `marker/store-map` type=icon 48×48 ×3
//                map-sheet 기준 (79.5, 252.12) · (285.5, 176.12) · (32.5, 56.12)
//   시트         `sheet/store-detail` y334 h315 · bg white · radius/3xl 상단 ·
//                **drop-shadow 0 -4px 6px rgba(74,86,103,0.2)** · px-16 pt-28 pb-20
//                안에 `store-picker-list` 3행(`row/store-option` 89)
//
// ⚠️ **Figma가 `sheet/store-detail`을 여기에 재사용하지만 내용이 전혀 다르다** —
//    라이브러리 규격은 "헤더 + 본문 + CTA"인데 여기는 헤더도 CTA도 없이 가게 목록만 있다.
//    그래서 레포 `app/_components/sheet-store-detail.tsx`를 쓰지 않고 이 화면에서 시트 셸을
//    실측값대로 직접 그렸다. (GUI피드백.md에 기록 — wrapper 이름 불일치, design-guide §1-4 유형)
//
// ⚠️ 마커 좌표를 px 고정이 아니라 **퍼센트 + 중심 앵커**로 옮겼다. 390px는 기준 뷰포트일 뿐이고
//    (conventions #3), 마커는 type이 바뀌면 폭이 48→108→128로 변해서 중심을 보존해야 안 튄다
//    (GUI피드백 "F03 마커 중심 앵커 고정"과 같은 처리).
//
// ⚠️ 지도는 실제 지도 SDK가 아니라 회색 placeholder다 — `shared/pages.md` F07과 같은 방침
//    (카카오 SDK 없이 상대 좌표 핀). Figma도 `map-placeholder` 이미지다.
//
// Figma 개발 주석:
//   시트(364:8298) — "해당 시트는 현재 높이가 최대. 리스트가 길어질 시 리스트 영역 안에서 스크롤 되게."
//                    → 시트 높이를 고정하고 목록만 스크롤시킨다.
//   행(364:8300)   — "탭한 즉시 F04-1_야채 제보로 이동" → 행 전체가 Link이고 즉시 확정된다(CTA 없음).
//
// 상태 3종: 이 화면의 데이터는 모듈 상수라 로딩·에러 지점이 없다.
//   ⚠️ **근처 가게가 0개인 빈 상태가 Figma에 없다** (GUI피드백.md에 기록). 위치 권한 거부·검색
//      결과 없음이 실제로 발생하는 자리인데 시안이 없어 임의 화면을 만들지 않았다.

export const metadata: Metadata = {
  title: "판매 장소 선택 | 장보고",
};

/**
 * Figma map-sheet(390×649) 기준 마커 중심 좌표를 퍼센트로 환산한 값.
 * (x + 24, y + 24) / (390, 649) — 48px 마커의 중심이다.
 */
const MARKER_POSITIONS = [
  { left: "26.54%", top: "42.55%" },
  { left: "79.36%", top: "30.83%" },
  { left: "14.49%", top: "12.34%" },
] as const;

interface ReportPlacePageProps {
  searchParams: Promise<{ item?: string; place?: string }>;
}

export default async function ReportPlacePage({ searchParams }: ReportPlacePageProps) {
  const { item } = await searchParams;
  const places = getReportPlaces();

  function hrefFor(placeId: string) {
    const params = new URLSearchParams();
    if (item) params.set("item", item);
    params.set("place", placeId);
    return `${ROUTES.report}?${params.toString()}`;
  }

  const backParams = new URLSearchParams();
  if (item) backParams.set("item", item);

  return (
    <main className="min-h-dvh bg-surface-secondary">
      <div className="mx-auto flex h-dvh w-full max-w-97.5 flex-col overflow-hidden bg-surface-primary">
        <ReportHeader
          leading={
            <Link
              href={`${ROUTES.report}${backParams.size > 0 ? `?${backParams.toString()}` : ""}`}
              aria-label="장소 선택 닫기"
              className="flex size-12 items-center justify-center"
            >
              <FigmaIcon name="close" width={24} />
            </Link>
          }
        />

        {/* 제목 밴드 — 헤더 아래 27px(실측), 좌우 16. */}
        <div className="shrink-0 px-4 pt-6.75">
          <h1 className="text-title-20-semibold text-content-primary">
            야채 가격을 확인한
            <br />
            장소를 선택해 주세요
          </h1>
        </div>

        {/* 지도 밴드 — Figma map-sheet(y195~844). 내용을 클립하고 시트를 바닥에 붙인다. */}
        <div className="relative mt-4.25 min-h-0 flex-1 overflow-hidden bg-surface-secondary">
          {places.map((place, index) => {
            const position = MARKER_POSITIONS[index % MARKER_POSITIONS.length];
            return (
              <Link
                key={place.id}
                href={hrefFor(place.id)}
                aria-label={`${place.name} 선택`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: position.left, top: position.top }}
              >
                <MarkerStoreMap
                  label={place.name}
                  icon={<FigmaIcon name="store-fill-marker-24" width={24} />}
                />
              </Link>
            );
          })}

          {/*
            시트 — 실측 h315(pt28 + 목록 267 + pb20). 목록만 스크롤한다(개발 주석).
            그림자는 Figma 값 그대로: 0 -4px 6px rgba(74,86,103,0.2) = gray/700 20%.
          */}
          <div
            className="absolute inset-x-0 bottom-0 flex max-h-full flex-col rounded-t-3xl bg-surface-primary px-4 pb-5 pt-7"
            style={{ boxShadow: "0px -4px 6px 0px rgba(74, 86, 103, 0.2)" }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
              <ul className="flex w-full flex-col items-start">
                {places.map((place) => (
                  <li key={place.id} className="w-full">
                    <RowStoreOption
                      name={place.name}
                      distance={place.distance}
                      address={place.address}
                      href={hrefFor(place.id)}
                      thumbnail={
                        <FigmaImage
                          name="store-thumbnail.png"
                          width={56}
                          height={56}
                          className="size-full object-cover"
                        />
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
