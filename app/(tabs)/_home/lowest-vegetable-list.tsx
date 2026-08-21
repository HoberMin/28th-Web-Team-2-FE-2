"use client";

import { useState, type ReactNode } from "react";
import { Button } from "../../_components/button";

// F01 「우리 동네 최저가 야채」의 접기/펼치기 leaf. **이 화면에서 유일한 클라이언트 컴포넌트다.**
//
// Figma F01_홈(298:3477)과 F01_홈_더보기(298:3509)는 **별개 화면이 아니라 같은 화면의 두 상태다** —
// 두 프레임의 차이는 (a) 목록 5행 ↔ 10행, (b) 버튼 라벨 "더보기" ↔ "닫기" 뿐이고 나머지는 동일하다.
// 그래서 라우트를 나누지 않고 이 토글 하나로 처리한다.
//
// 행(list/lowest-vegetable)은 여기서 만들지 않고 **서버가 만들어 `rows`로 넘긴다** — 목록 컴포넌트와
// 그 의존성(VegetablePrice·VegetableTrend)을 클라이언트 번들에 끌어들이지 않기 위해서다
// (conventions #10 — 지시어는 정말 필요한 잎에만).
//
// ⚠️ 버튼: Figma의 `button/base`(298:3500 · 298:3532)는 우리 `button.tsx`의 어느 size에도 맞지 않는다.
//    Figma 실측 = bg action-tertiary/default · text content/secondary · body/16-semibold ·
//    px-28 py-12 (= medium) 인데 **radius는 radius/md 8px (= small)** 이고, 게다가 h-[44px] 고정과
//    py-12는 서로 모순이다(12+24.8+12 = 48.8px). 마스터도 코드가 참조하는 `button/cta_md`(160-2855)가
//    아니라 별개 컴포넌트(173:3173 계열)다.
//    → `button.tsx`를 고치지 않고 **가장 가까운 기존 variant**(tertiary · medium)로 렌더하되,
//      화면에서 **높이와 radius를 Figma 원본으로 덮는다**(실측 429:16757 = h-[44px] ·
//      rounded-[radius/md 8px] · px-28 py-12 · gap-8).
//      높이는 UI QA 2026-08-20 #7, radius는 08-20 "Figma 원본 그대로" 지시로 맞췄다.
//    ⚠️ 라벨 대비: content/secondary(#697383) on action-tertiary/default(#f2f3f8) = 4.26:1 →
//       16px 기준 4.5:1 미달. Figma 원본 유지 + 사실만 기록한다(figma-bridge §4).

export interface LowestVegetableListProps {
  /** 서버가 미리 그려 넘긴 전체 행. */
  rows: ReactNode[];
  /** 접힌 상태에서 보여줄 행 수. */
  collapsedCount: number;
  /** 목록 컨테이너의 id — 버튼의 aria-controls가 가리킨다. */
  listId: string;
}

export function LowestVegetableList({ rows, collapsedCount, listId }: LowestVegetableListProps) {
  const [expanded, setExpanded] = useState(false);

  const hasMore = rows.length > collapsedCount;
  const visibleRows = expanded ? rows : rows.slice(0, collapsedCount);

  return (
    // Figma 298:3520: flex-col gap-[8px] — 목록 묶음과 버튼 사이 간격.
    <div className="flex w-full flex-col items-start gap-2">
      <div id={listId} className="flex w-full flex-col items-start">
        {visibleRows}
      </div>

      {hasMore ? (
        <Button
          variant="tertiary"
          size="medium"
          leading={false}
          trailing={false}
          // radius는 className이 아니라 prop으로 넘긴다 — `rounded-md`를 className에 얹으면
          // SIZE의 `rounded-lg`와 같은 속성이 겹쳐 `@theme` 선언 순서 때문에 lg가 이긴다
          // (2026-08-21 교정: 08-20의 radius 수정이 이 이유로 화면에 안 나타났다).
          radius="md"
          className="h-11 w-full"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "닫기" : "더보기"}
        </Button>
      ) : null}
    </div>
  );
}
