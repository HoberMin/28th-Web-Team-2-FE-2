"use client";

import { useRouter } from "next/navigation";
import { FilterChip } from "../../_components/filter-chip";
import { buildPricesHref } from "./_href";

// Figma `filter/chip`(298-3435~3438 / 298-3472~3476) 재사용 — 실측이 기존 컴포넌트와 일치한다.
//
// ⚠️ **Figma의 칩 목록은 실제 카테고리 세트가 아니다.** 기본 프레임은 `전체 46 · 감자·뿌리 5 ·
//    잎채소 12 · 잎채소 12`로 3번째 칩이 그대로 복제돼 있고, 검색 프레임은 4·5번째가 같은 복제다.
//    개수(46·5·12)가 코드 카탈로그의 실제 값과 정확히 일치하므로, 복제된 자리는 아직 안 채운
//    자리로 보고 **코드의 정본 그룹 7종**(`VEGETABLE_GROUPS`)으로 렌더한다. 정본 카테고리 목록
//    확정은 디자이너 확인 필요.
//
// ⚠️ 칩 행은 **가로 스크롤**이다. Figma 좌표상 5칩이 x=483까지 뻗어 390 화면을 넘고, 4칩(388)도
//    우측 여백 16을 못 지킨다. 줄바꿈이 아니라 가로 스크롤이 원본 의도에 맞다.
//    스크롤바 막대는 `no-scrollbar`로 숨긴다(globals.css의 기존 유틸).
//
// ⚠️ 칩 높이 38px은 권장 터치 타겟 44보다 작다 — Figma 원본 유지 + 기록.

export interface PricesGroupChipsProps {
  groups: readonly string[];
  counts: Record<string, number>;
  /** 전체 개수 — "전체" 칩에 붙는다. */
  totalCount: number;
  /** 현재 선택된 그룹. 없으면 "전체". */
  selected?: string;
  query: string;
  sort?: string;
}

export function PricesGroupChips({
  groups,
  counts,
  totalCount,
  selected,
  query,
  sort,
}: PricesGroupChipsProps) {
  const router = useRouter();

  const go = (group?: string) => {
    router.replace(buildPricesHref({ q: query, group, sort }), { scroll: false });
  };

  return (
    <div
      // 목록이 좌우 끝까지 흐르되 첫·마지막 칩은 화면 여백 16을 지킨다.
      className="no-scrollbar flex gap-2 overflow-x-auto px-4"
    >
      <FilterChip
        label="전체"
        count={totalCount}
        selected={!selected}
        onClick={() => go(undefined)}
        className="shrink-0"
      />
      {groups.map((group) => (
        <FilterChip
          key={group}
          label={group}
          count={counts[group] ?? 0}
          selected={selected === group}
          // 이미 고른 칩을 다시 누르면 전체로 되돌린다 — aria-pressed(토글) 의미와 맞춘다.
          // Figma에 재선택 동작 정의가 없어 정한 기본값이다.
          onClick={() => go(selected === group ? undefined : group)}
          className="shrink-0"
        />
      ))}
    </div>
  );
}
