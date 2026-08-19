"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/button";
import { RowSortOption } from "@/app/_components/row-sort-option";
import { TextField } from "@/app/_components/text-field";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "@/app/_lib/routes";
import type { ReportVegetableOption } from "../_data";
import { ReportCtaFooter } from "../_components/report-cta-footer";

// 실측 출처: 장보고 Design `d5j7K9BNpSXxVUu3fmZfY4` / `화면GUI(원본)` 364:6742 — 상세는 `app/report/page.tsx` 머리말.

// F04-2 야채 카테고리 2단 — Figma 화면GUI(원본) 364:8093(목록) · 8111(검색 후) ·
// 8121(검색결과 없음) · 8127(야채 선택).
//
// **행에 chevron이 없고 하단 CTA가 있다** → 행은 이동이 아니라 선택이고 확정은 CTA가 한다.
// (1단 카테고리 8068~8091은 반대로 행마다 chevron이 있고 CTA가 없다)
//
// ✅ 행 규격이 레포 `app/_components/row-sort-option.tsx`와 **정확히 일치**해서 재사용했다:
//    py-[16px] + border-b border/secondary + body/16-medium content/primary,
//    선택 시 gap-[4px] + 20px check → 높이 16+25+16+1 = **58px** (XML 실측과 일치).
//
// 실측:
//   body     x16 y106 · flex flex-col **gap-[20px]**
//   목록     8093·8127은 11행(h638) · 8111은 3행(h174)
//   빈 상태  8121 — `일치하는 야채가 없어요 :(` 156×25 · x117(=가운데) · y**409.5**
//   CTA      390×74 (px16 py12 + border-t)
//
// ⚠️ 빈 상태 문구의 y=409.5가 소수점이고, 콘텐츠 영역(158~770)의 정확한 가운데(464)도 아니다.
//    코드는 남은 공간 가운데에 둔다 — 소수점 좌표를 고정 top으로 옮기면 다른 화면 높이에서 깨진다.
//    (GUI피드백.md에 기록)
//
// 상태 3종: 빈=검색 결과 없음(위 8121 구현). 로딩·에러는 데이터가 모듈 상수라 발생 지점이 없다.

export interface VegetablePickerProps {
  /** 폼으로 돌아갈 때 유지할 선택값 쿼리스트링. */
  carryQuery: string;
  /** 검색 화면으로 들어온 경우의 초기 검색어. */
  initialQuery: string;
  /** 이미 고른 품목 id(폼에서 "다시 선택"으로 들어온 경우). */
  selectedId?: string;
  vegetables: ReportVegetableOption[];
}

export function VegetablePicker({
  carryQuery,
  initialQuery,
  selectedId,
  vegetables,
}: VegetablePickerProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState(selectedId ?? "");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    const params = new URLSearchParams(carryQuery.replace(/^\?/, ""));
    if (q) params.set("q", q);
    router.push(`${ROUTES.reportVegetable}${params.size > 0 ? `?${params.toString()}` : ""}`);
  }

  function handleConfirm() {
    if (!selected) return;
    const params = new URLSearchParams(carryQuery.replace(/^\?/, ""));
    params.set("item", selected);
    router.push(`${ROUTES.report}?${params.toString()}`);
  }

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden px-4 pt-3.25">
        <form role="search" className="w-full shrink-0" onSubmit={handleSearch}>
          <label className="sr-only" htmlFor="report-vegetable-search-2">
            제보할 야채 검색
          </label>
          <TextField
            id="report-vegetable-search-2"
            name="q"
            type="search"
            inputMode="search"
            value={query}
            placeholder="제보할 야채를 검색해 보세요"
            // UI QA 2026-08-20 #41: 이 화면의 안내문구는 content/disabled가 아니라 content/primary다.
            inputClassName="placeholder:text-content-primary"
            trailing={
              query ? (
                <button
                  type="button"
                  aria-label="검색어 지우기"
                  className="flex size-6 items-center justify-center text-content-secondary"
                  onClick={() => setQuery("")}
                >
                  <FigmaIcon name="close-fill" width={24} />
                </button>
              ) : (
                <span className="flex size-6 items-center justify-center text-content-secondary">
                  <FigmaIcon name="search" width={24} currentColor />
                </span>
              )
            }
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>

        {vegetables.length > 0 ? (
          <div className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            <div className="flex w-full flex-col items-start">
              {vegetables.map((vegetable) => (
                <RowSortOption
                  key={vegetable.id}
                  label={vegetable.name}
                  selected={selected === vegetable.id}
                  checkIcon={<FigmaIcon name="check" width={20} currentColor />}
                  onClick={() => setSelected(vegetable.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          // Figma 364:8121 — 문구 하나뿐이다(그래픽·재검색 버튼 없음). 원본대로 문구만 둔다.
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <p className="text-body-16-medium text-content-primary">일치하는 야채가 없어요 :(</p>
          </div>
        )}
      </div>

      <ReportCtaFooter>
        <Button
          variant="secondary"
          leading={false}
          trailing={false}
          className="w-full"
          disabled={!selected}
          onClick={handleConfirm}
        >
          확인
        </Button>
      </ReportCtaFooter>
    </>
  );
}
