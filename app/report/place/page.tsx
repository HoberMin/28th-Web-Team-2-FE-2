import Link from "next/link";
import type { Metadata } from "next";
import { MAP_CENTER, MAP_REGION } from "@/app/(tabs)/stores/_data";
import { searchNearbyStorePlaces } from "@/app/_lib/kakao-places";
import type { StoreRequest } from "@/app/_lib/api/schemas/reports";
import { formatDistance } from "@/app/_lib/store-locations";
import { MarkerStoreMap } from "@/app/_components/marker-store-map";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import { ROUTES } from "@/app/_lib/routes";
import { ReportHeader } from "../_components/report-header";
import { RowStoreOption } from "../_components/row-store-option";
import { encodeCarriedStore } from "../_data";
import { ReportPlaceMap } from "./_report-place-map";

// 실측 출처: 장보고 Design `d5j7K9BNpSXxVUu3fmZfY4` / `화면GUI(원본)` 364:6742 — 상세는 `app/report/page.tsx` 머리말.

// F04-3 판매 장소 선택 — Figma 화면GUI(원본) 364:8293.
//
// **Server Component다.** 장소 검색·행·라우팅은 서버에 두고, 지도 SDK 초기화만
// `place/_report-place-map.tsx` 클라이언트 leaf에서 맡긴다.
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
// 지도는 카카오 Maps JS SDK를 실제로 초기화한다. 공개 앱 키가 없거나 도메인 제한으로
// SDK가 실패하면 동일한 영역에 안내 문구를 보여주고, 목록 선택은 계속 가능하게 둔다.
//
// Figma 개발 주석:
//   시트(364:8298) — "해당 시트는 현재 높이가 최대. 리스트가 길어질 시 리스트 영역 안에서 스크롤 되게."
//                    → 시트 높이를 고정하고 목록만 스크롤시킨다.
//   행(364:8300)   — "탭한 즉시 F04-1_야채 제보로 이동" → 행 전체가 Link이고 즉시 확정된다(CTA 없음).
//
// ── 2026-08-19: 더미 3곳 → 실제 카카오 로컬 검색으로 교체 ────────────────────────
// 로그인 사용자의 실시간 위치를 아직 서버에서 모른다(`(tabs)/stores`도 같은 상태) — 그래서
// `(tabs)/stores/_initial-nearby.ts`와 같은 폴백 좌표(`MAP_CENTER`)를 그대로 재사용한다.
// 실좌표 확보 로직이 생기면 이 화면과 `_initial-nearby.ts`가 함께 바뀔 자리다.
//
// 검색 결과는 id로 재조회할 수 없어(카카오 키워드 검색 API 특성상) 고른 장소의 필드 전체를
// `store` 쿼리 파라미터(JSON)로 실어 F04-1로 돌려보낸다(`_data.ts#encodeCarriedStore`).
//
// 상태 3종: 데이터 페칭은 `searchNearbyStorePlaces`가 실패 시 내부에서 결정적 더미로
// 폴백하도록 이미 설계돼 있어(카카오 실패 → 화면이 깨지지 않는다) 별도 에러 화면이 없다.
// 로딩은 `loading.tsx`. **근처 가게가 0개인 빈 상태는 여전히 Figma에 없다** — 폴백도 항상
// 최소 2곳을 주므로 실질적으로 발생하지 않는다(GUI피드백.md에 기록된 내용 유지).

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
  searchParams: Promise<{ item?: string }>;
}

export default async function ReportPlacePage({ searchParams }: ReportPlacePageProps) {
  const { item } = await searchParams;
  const places = await searchNearbyStorePlaces({
    lat: MAP_CENTER.lat,
    lng: MAP_CENTER.lng,
    district: MAP_REGION,
  });

  function hrefFor(store: StoreRequest) {
    const params = new URLSearchParams();
    if (item) params.set("item", item);
    params.set("store", encodeCarriedStore(store));
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
          <ReportPlaceMap center={MAP_CENTER} />

          {places.map((place, index) => {
            const position = MARKER_POSITIONS[index % MARKER_POSITIONS.length];
            return (
              <Link
                key={place.id}
                href={hrefFor(place)}
                aria-label={`${place.placeName} 선택`}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: position.left, top: position.top }}
              >
                <MarkerStoreMap
                  label={place.placeName}
                  icon={<FigmaIcon name="store-fill-marker-24" width={24} />}
                />
              </Link>
            );
          })}

          {/*
            시트 — 실측 h315(pt28 + 목록 267 + pb20). 목록만 스크롤한다(개발 주석).
            그림자는 Figma 값 그대로: 0 -4px 6px rgba(74, 86, 103, 0.2) = gray/700 20%.
          */}
          <div
            className="absolute inset-x-0 bottom-0 z-20 flex max-h-full flex-col rounded-t-3xl bg-surface-primary px-4 pb-5 pt-7"
            style={{ boxShadow: "0px -4px 6px 0px rgba(74, 86, 103, 0.2)" }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
              <ul className="flex w-full flex-col items-start">
                {places.map((place) => (
                  <li key={place.id} className="w-full">
                    <RowStoreOption
                      name={place.placeName}
                      distance={formatDistance(place.distance ?? 0)}
                      address={place.roadAddressName || place.addressName}
                      href={hrefFor(place)}
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
