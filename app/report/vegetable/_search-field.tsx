"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/app/_components/text-field";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "@/app/_lib/routes";

// 실측 출처: 장보고 Design `d5j7K9BNpSXxVUu3fmZfY4` / `화면GUI(원본)` 364:6742 — 상세는 `app/report/page.tsx` 머리말.

// F04-2 야채 카테고리 1단의 검색 필드 — Figma 화면GUI(원본) 364:8066.
//
// 실측: `field/text` bg surface/secondary · h-[52px] · px-[16px] py-[8px] · radius/lg ·
//       안내문구 "제보할 야채를 검색해 보세요" · 우측 `icon/search` 24
//       → 레포 `app/_components/text-field.tsx`가 이 규격 그대로다(h-13 px-4 py-2 rounded-lg
//         bg-surface-secondary) → **재사용한다.**
//
// 입력하고 제출하면 2단(검색 결과)으로 넘어간다 — 검색 상태를 URL이 들고 있어야 서버에서
// 결과를 그려 낼 수 있다(뒤로가기도 자연히 동작한다).
//
// ⚠️ Figma에 **입력 중 실시간 필터인지 제출인지 정의가 없다.** 8111(검색 후)은 결과가 이미
//    나온 화면이라 어느 쪽인지 판별되지 않는다. 매 글자마다 라우팅하면 히스토리가 오염되므로
//    **제출(엔터) 기준**으로 뒀다. (GUI피드백.md에 기록)

export interface VegetableSearchFieldProps {
  /** 폼으로 돌아갈 때 유지할 선택값 쿼리스트링. */
  carryQuery: string;
}

export function VegetableSearchField({ carryQuery }: VegetableSearchFieldProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    const params = new URLSearchParams(carryQuery.replace(/^\?/, ""));
    params.set("q", q);
    router.push(`${ROUTES.reportVegetable}?${params.toString()}`);
  }

  return (
    <form role="search" className="w-full" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="report-vegetable-search">
        제보할 야채 검색
      </label>
      <TextField
        id="report-vegetable-search"
        name="q"
        type="search"
        inputMode="search"
        value={query}
        placeholder="제보할 야채를 검색해 보세요"
        trailing={
          query ? (
            <button
              type="button"
              aria-label="검색어 지우기"
              className="flex size-6 items-center justify-center text-content-secondary"
              onClick={() => setQuery("")}
            >
              <FigmaIcon name="close-fill" width={20} currentColor />
            </button>
          ) : (
            <span className="text-content-secondary">
              <FigmaIcon name="search" width={24} currentColor />
            </span>
          )
        }
        onChange={(event) => setQuery(event.target.value)}
      />
    </form>
  );
}
