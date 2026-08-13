import Link from "next/link";
import type { Metadata } from "next";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "@/app/_lib/routes";
import { ReportHeader } from "../_components/report-header";
import { RowPickerOption } from "../_components/row-picker-option";
import { REPORT_CATEGORIES, getReportVegetablesByGroup, searchReportVegetables } from "../_data";
import { VegetableSearchField } from "./_search-field";
import { VegetablePicker } from "./_vegetable-picker";

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

export const metadata: Metadata = {
  title: "야채 카테고리 | 장보고",
};

interface ReportVegetablePageProps {
  searchParams: Promise<{ item?: string; place?: string; group?: string; q?: string }>;
}

export default async function ReportVegetablePage({ searchParams }: ReportVegetablePageProps) {
  const { item, place, group, q } = await searchParams;

  // 폼으로 돌아갈 때 유지할 선택값.
  const carry = new URLSearchParams();
  if (item) carry.set("item", item);
  if (place) carry.set("place", place);
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
          // 2단 — 야채 목록/검색 결과. 행은 **선택**이고 확정은 하단 CTA가 한다.
          <VegetablePicker
            carryQuery={carryQuery}
            initialQuery={q ?? ""}
            selectedId={item}
            vegetables={
              q?.trim() ? searchReportVegetables(q) : getReportVegetablesByGroup(group ?? "")
            }
          />
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
                      ...(place ? { place } : {}),
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
