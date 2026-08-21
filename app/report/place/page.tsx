import Link from "next/link";
import type { Metadata } from "next";
import { getSelectedRegion } from "@/app/_lib/api/server/selected-region";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ASSADA_MART_CENTER } from "@/app/_lib/assada-mart";
import { ROUTES } from "@/app/_lib/routes";
import { ReportHeader } from "../_components/report-header";
import { ReportPlaceMap } from "./_report-place-map";

// 실측 출처: 장보고 Design `d5j7K9BNpSXxVUu3fmZfY4` / `화면GUI(원본)` 364:6742 — 상세는 `app/report/page.tsx` 머리말.

// F04-3 판매 장소 선택 — Figma 화면GUI(원본) 364:8293.
//
// **Server Component다.** 선택 지역만 서버에서 읽고, 지도·장소 검색은
// 테스트 앱 JavaScript 키를 쓰는 `_report-place-map.tsx` 클라이언트 leaf에서 맡긴다.
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
// 선택 지역 쿠키의 **실제 좌표**를 JS SDK 장소 검색에 쓴다. 예전에는 지역명을 로컬 행정동
// 목록과 이름으로 재매칭했는데, Spring이 주는 지역명은 법정동 기준이라(역삼동 하나가
// 역삼1동·역삼2동처럼 행정동 여러 개로 쪼개지는 경우 등) 매칭이 자주 실패했다 —
// `/stores`가 애초에 이 재매칭을 안 거쳐서 멀쩡했던 것과 같은 이유.
//
// ⚠️ `/stores`가 쓰는 `getVerifiedSelectedRegion`이 아니라 `resolveSelectedRegionCoordinates`를
//    직접 쓴다. 전자는 복구한 좌표를 쿠키에 되쓰는데 **RSC 렌더 중 `cookies().set`은 Next가
//    막는다**("Cookies can only be modified in a Server Action or Route Handler" — `auth-session` §3).
//    좌표 없는 옛 쿠키를 가진 사용자에게 그 쓰기가 그대로 터져 안내 문구 대신 에러 화면이 뜬다.
//    저장 없는 복구만 쓰면 이 화면에서는 매 요청 재검색이지만(`/regions/search`는 하루 캐시)
//    화면은 정상 동작한다. 재검색 자체의 실패(Spring 장애 등)도 `.catch`로 흡수한다.
// 좌표 복구가 실패하면 가짜 가게를 만들지 않고 선택을 막는다.
// 로딩은 `loading.tsx`, 빈 결과와 검색 장애는 목록 영역의 상태 문구로 보여 준다.

export const metadata: Metadata = {
  title: "판매 장소 선택 | 장보고",
};

interface ReportPlacePageProps {
  searchParams: Promise<{
    item?: string;
    store?: string;
    price?: string;
    amount?: string;
    unit?: string;
  }>;
}

export default async function ReportPlacePage({ searchParams }: ReportPlacePageProps) {
  const { item, store, price, amount, unit } = await searchParams;
  const region = await getSelectedRegion();
  const center = ASSADA_MART_CENTER;
  const unavailableMessage = !region
    ? "동네를 먼저 선택해 주세요."
    : undefined;

  // "닫기"·장소 선택 모두 `/report`로 돌아간다 — 가격·양도 함께 실어 보내
  // 폼이 다시 마운트될 때 지워지지 않게 한다(`_report-form.tsx#buildPlaceQuery`와 짝).
  const backParams = new URLSearchParams();
  if (item) backParams.set("item", item);
  if (store) backParams.set("store", store);
  if (price) backParams.set("price", price);
  if (amount) backParams.set("amount", amount);
  if (unit) backParams.set("unit", unit);

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

        <ReportPlaceMap
          center={center}
          item={item}
          price={price}
          amount={amount}
          unit={unit}
          unavailableMessage={unavailableMessage}
        />
      </div>
    </main>
  );
}
