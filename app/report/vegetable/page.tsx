import Link from "next/link";
import type { Metadata } from "next";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getSelectedRegionId } from "@/app/_lib/api/server/selected-region";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "@/app/_lib/routes";
import { ReportHeader } from "../_components/report-header";
import { RowPickerOption } from "../_components/row-picker-option";
import { REPORT_CATEGORIES, getReportVegetables, normalizeReportGroup } from "../_data";
import { VegetableSearchField } from "./_search-field";
import { VegetablePicker } from "./_vegetable-picker";

// 실측 출처: 장보고 Design `d5j7K9BNpSXxVUu3fmZfY4` / `화면GUI(원본)` 364:6742 — 상세는 `app/report/page.tsx` 머리말.

// F04-2 야채 카테고리 — Figma 화면GUI(원본) 364:8063(카테고리) · 8093(야채 목록) ·
// 8111(검색 후) · 8121(검색결과 없음) · 8127(야채 선택).
//
// **Server Component다.** 클라이언트 지시어는 `_vegetable-picker.tsx`(검색·선택) 하나뿐이다.
//
// 5프레임을 두 단계로 읽었다. 근거는 **행의 우측 아이콘**이다:
//   1단 카테고리(8063)  행마다 `icon/chevron-right` 20 **있음** → 다음 화면으로 이동
//                       하단 CTA **없음**
//   2단 야채 목록(8093·8111·8121·8127)  행에 chevron **없음** + 하단 CTA 74 **있음**
//                       → 행은 이동이 아니라 **선택**이고, 확정은 CTA가 한다
//   (8093 ↔ 8127은 구조가 같고 CTA 프레임 이름만 다르다 — 미선택/선택 상태로 읽었다)
//
// get_design_context 실측(364:8065 `category-body`):
//   x16 y106 · flex flex-col **gap-[20px]** · w-358
//   field/text  h52 px16 py8 radius/lg · bg surface/secondary · icon/search 24
//   list        행 py-[16px] · border-b border/secondary → h 58
//
// ⚠️ 헤더 아래 여백이 F04-1은 **28**인데 이 화면은 **13**이다(둘 다 헤더 bottom 93 기준).
//    13은 4의 배수도 아니다. 실측값을 그대로 옮겼다(GUI피드백.md에 기록).
//
// ⚠️ Figma 검색 필드의 안내문구가 `content/primary`에 바인딩돼 있다 — 같은 파일의 온보딩 지역
//    검색(364:8018)은 `content/disabled`다. 안내문구를 본문색으로 그리면 **값이 입력된 것처럼**
//    보이므로 여기서는 `content/disabled`(= 실제 placeholder)를 따랐다.
//    (GUI피드백.md에 기록 — Figma 바인딩 정리 필요)
//
// 상태 3종(2026-08-19 갱신 — 더미에서 실 Spring 연동으로 바뀌며 로딩·에러가 실제로 발생한다):
//   로딩 = `loading.tsx` (Server Component 렌더 전 fetch를 Next가 자동으로 그 자리로 대체)
//   에러 = `error.tsx` (getItems 실패를 그대로 던지고 경계에서 잡는다 — `(tabs)/prices`와 같은 패턴)
//   빈  = 아래 8121 구현(검색 결과 없음)

export const metadata: Metadata = {
  title: "야채 카테고리 | 장보고",
};

function MissingRegion() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
      <p className="text-title-18-bold text-content-primary">동네 정보가 필요해요</p>
      <p className="text-body-14-regular text-content-secondary">
        온보딩에서 동네를 선택하면 그 동네 품목으로 제보할 수 있어요.
      </p>
      <Link
        href={ROUTES.home}
        className="mt-2 inline-flex min-h-11 items-center justify-center rounded-lg bg-action-tertiary-default px-4 py-2 text-body-14-medium text-content-primary"
      >
        홈으로
      </Link>
    </div>
  );
}

interface ReportVegetablePageProps {
  searchParams: Promise<{ item?: string; store?: string; group?: string; q?: string }>;
}

export default async function ReportVegetablePage({ searchParams }: ReportVegetablePageProps) {
  const { item, store, group, q } = await searchParams;

  // 폼으로 돌아갈 때 유지할 선택값.
  const carry = new URLSearchParams();
  if (item) carry.set("item", item);
  if (store) carry.set("store", store);
  const carryQuery = carry.size > 0 ? `?${carry.toString()}` : "";

  const isSecondStep = Boolean(group) || Boolean(q?.trim());

  return (
    <main className="min-h-dvh bg-surface-secondary">
      <div className="mx-auto flex h-dvh w-full max-w-97.5 flex-col overflow-hidden bg-surface-primary">
        <ReportHeader
          title="야채 카테고리"
          leading={
            // Figma 개발 주석(364:8064 뒤로 슬롯): "F04-1_야채 제보로 이동".
            // 2단(야채 목록)에서는 1단(카테고리)으로 돌아가는 게 자연스럽지만 시안에 정의가 없어
            // 주석대로 항상 폼으로 보낸다.
            <Link
              href={`${ROUTES.report}${carryQuery}`}
              aria-label="야채 제보로 돌아가기"
              className="flex size-12 items-center justify-center"
            >
              <FigmaIcon name="chevron-left" width={24} />
            </Link>
          }
        />

        {isSecondStep ? (
          <SecondStep carryQuery={carryQuery} group={group} q={q ?? ""} selectedId={item} />
        ) : (
          // 1단 — 카테고리. 행마다 chevron이 있어 이동이고, 하단 CTA가 없다.
          // 검색 필드만 클라이언트 leaf이고 목록은 서버에서 그린다.
          <div className="flex-1 overflow-y-auto px-4 pt-3.25">
            <div className="flex flex-col gap-5">
              <VegetableSearchField carryQuery={carryQuery} />
              <div className="flex w-full flex-col items-start">
                {REPORT_CATEGORIES.map((category) => (
                  <RowPickerOption
                    key={category}
                    label={category}
                    href={`${ROUTES.reportVegetable}?${new URLSearchParams({
                      ...(item ? { item } : {}),
                      ...(store ? { store } : {}),
                      group: category,
                    }).toString()}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// 2단(야채 목록/검색 결과)만 regionId·토큰이 필요해 별도 async 컴포넌트로 분리했다 —
// 1단(카테고리)은 지역이 없어도 보여줄 수 있는 정적 목록이라 이 검사를 거치지 않는다.
async function SecondStep({
  carryQuery,
  group,
  q,
  selectedId,
}: {
  carryQuery: string;
  group: string | undefined;
  q: string;
  selectedId: string | undefined;
}) {
  const regionId = await getSelectedRegionId();
  if (!regionId) {
    return <MissingRegion />;
  }

  const token = await getAccessToken();
  const { vegetables, isTemporary } = await getReportVegetables({
    regionId,
    token,
    category: normalizeReportGroup(group),
    keyword: q.trim() || undefined,
  });

  return (
    <VegetablePicker
      carryQuery={carryQuery}
      initialQuery={q}
      selectedId={selectedId}
      vegetables={vegetables}
      isTemporary={isTemporary}
    />
  );
}
