"use client";

import { useState } from "react";
import Link from "next/link";
import IconMagnifyingglassLine from "@karrotmarket/react-monochrome-icon/IconMagnifyingglassLine";
import IconChevronDownSmallLine from "@karrotmarket/react-monochrome-icon/IconChevronDownSmallLine";
import IconCheckmarkLine from "@karrotmarket/react-monochrome-icon/IconCheckmarkLine";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ChipLabel, RadioChipItem, RadioChipRoot } from "seed-design/ui/chip";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetRoot,
  BottomSheetTrigger,
} from "seed-design/ui/bottom-sheet";
import type { HomeVegetableItem } from "../_lib/home-data";
import { VEGETABLE_GROUPS } from "../_lib/vegetables";
import { formatAsOfLabel, formatNumber } from "../_lib/format";
import { matchesVegetableName } from "../_lib/search";
import { TrendLabel } from "./trend-label";
import { VegetableThumb } from "./vegetable-thumb";

const ALL = "전체";
/** 기본으로 보여주는 개수 — 「더보기」로 전체(46종)까지 펼친다. */
const PAGE_SIZE = 12;

type SortKey = "name" | "cheap" | "drop";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name", label: "가나다순" },
  { value: "cheap", label: "싼 순" },
  { value: "drop", label: "많이 내린 순" },
];

function sortItems(items: HomeVegetableItem[], sort: SortKey): HomeVegetableItem[] {
  const copy = [...items];
  switch (sort) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    case "cheap":
      return copy.sort((a, b) => {
        if (a.price === null && b.price === null) return 0;
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return a.price - b.price;
      });
    case "drop":
      return copy.sort((a, b) => {
        const dropA = a.trend?.direction === "down" ? a.trend.pct : -Infinity;
        const dropB = b.trend?.direction === "down" ? b.trend.pct : -Infinity;
        return dropB - dropA;
      });
  }
}

// F01-1 야채 시세 — GNB 탭 루트 콘텐츠. 검색 + 그룹 필터 + 정렬 + 야채 그리드.
// 2026-07-31 홈 개편으로 F01(홈)에서 분리했다 — 홈은 여러 정보를 모아 액션을 유도하는
// 대시보드 역할로, 46종 전체 조회는 여기 전용 탭으로 옮겼다(홈에 잠깐 남았던 미리보기
// 섹션도 이후 정리로 뺐다 — 전용 탭이 있는데 축약판을 홈에 또 두지 않는다).
// AppBar가 이미 "야채 시세"를 제목으로 달고 있어 여기 안에서는 그 단어를 다시 헤더로
// 반복하지 않는다(검색 중엔 "검색 결과"로 상태만 알림).
//
// 기본 12종만 보여주고 「더보기」로 46종 전체를 편다(정렬을 바꾸면 다시 12종으로 접힌다) —
// 46종을 한 번에 3열로 쏟으면 16줄이라 화면이 스크롤에 잠긴다.
// 데이터는 서버(getHomeData)에서 조립해 props로 받는다 — 시세·등락 계산은 클라에서 하지 않는다.
export function VegetablePriceList({
  items,
  priceMeta,
}: {
  items: HomeVegetableItem[];
  priceMeta: { asOf: string; isFallback: boolean };
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>(ALL);
  const [sort, setSort] = useState<SortKey>("name");
  const [expanded, setExpanded] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const keyword = query.trim();

  // 검색어가 있으면 그룹 필터를 무시한다 — 이름을 아는 사람은 이미 목적지가 있다.
  const filtered = keyword
    ? items.filter((v) => matchesVegetableName(v.name, keyword))
    : group === ALL
      ? items
      : items.filter((v) => v.group === group);

  const sorted = sortItems(filtered, sort);
  // 검색 중에는 결과를 자르지 않는다 — 찾는 게 목적인 화면에서 페이지네이션은 방해다.
  const list = !keyword && !expanded ? sorted.slice(0, PAGE_SIZE) : sorted;
  const canShowMore = !keyword && !expanded && sorted.length > PAGE_SIZE;

  function handleSortChange(next: SortKey) {
    setSort(next);
    setExpanded(false); // 정렬이 바뀌면 다시 12종으로 접힌다
    setSortSheetOpen(false);
  }

  const sortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "";
  // 검색 중엔 "검색 결과"로, 아니면 "N종 · 기준일"로 — 예전엔 이걸 별도 h2로 뒀는데,
  // 정렬 버튼과 한 줄에 놓으면서 캡션 하나로 합쳤다(중복 헤더를 만들지 않는다).
  const metaText = keyword
    ? `‘${keyword}’ 검색 결과 · ${sorted.length}종`
    : `${sorted.length}종 · ${formatAsOfLabel(priceMeta.asOf)}${priceMeta.isFallback ? " · 예시 데이터" : ""}`;

  return (
    <div className="flex flex-col gap-4 px-4 pt-1 pb-8">
      {/* label prop을 쓰면 시각 라벨이 함께 생긴다 — aria-label만 두면 placeholder가 사라진 뒤
          이 칸이 무엇을 받는 칸인지 화면에 남지 않는다(타깃 연령대에서 특히 불리하다) */}
      <TextField
        label="야채 검색"
        value={query}
        onValueChange={(v) => setQuery(v.value)}
        prefixIcon={<IconMagnifyingglassLine />}
      >
        <TextFieldInput placeholder="야채 이름 또는 초성으로 검색 (예: ㄱㅈ)" />
      </TextField>

      <div className="flex flex-col gap-3">
        {/* 검색 결과 상태는 시각적으로는 캡션 하나(metaText)로 합쳤지만, 헤딩 내비게이션을
            쓰는 스크린리더 사용자를 위해 sr-only h2는 남겨둔다 — 안 보이되 여전히 "검색
            결과" 지점으로 건너뛸 수 있어야 한다. */}
        {keyword && <h2 className="sr-only">검색 결과</h2>}

        {/* 정렬을 종류 필터보다 위에 둔다 — 종류(가로 칩, 눈에 띔)는 주 내비게이션이고
            정렬은 보조 컨트롤이라, 누르면 열리는 작은 버튼 + 바텀시트로 확실히 위계를
            낮췄다(예전엔 둘 다 같은 칩 UI라 뭐가 필터고 뭐가 정렬인지 구분이 안 갔다).
            버튼과 옆의 "N종 · 기준일" 텍스트는 items-center로 y축을 맞춘다. */}
        <div className="flex items-center justify-between">
          <BottomSheetRoot open={sortSheetOpen} onOpenChange={setSortSheetOpen}>
            <BottomSheetTrigger asChild>
              <button
                type="button"
                className="flex shrink-0 items-center gap-1 rounded-lg border border-bg-neutral-weak px-3 py-1.5 text-caption-12-medium text-fg-neutral active:bg-bg-neutral-weak"
              >
                정렬 · {sortLabel}
                <span className="text-fg-neutral-muted [&_svg]:size-3.5" aria-hidden="true">
                  <IconChevronDownSmallLine />
                </span>
              </button>
            </BottomSheetTrigger>
            <BottomSheetContent title="정렬" showHandle>
              <BottomSheetBody className="flex flex-col gap-1 pb-2">
                {SORT_OPTIONS.map((option) => {
                  const selected = option.value === sort;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSortChange(option.value)}
                      className={`flex items-center justify-between rounded-xl px-3 py-3 active:bg-bg-neutral-weak ${
                        selected ? "text-body-16-semibold text-fg-brand-contrast" : "text-body-16-regular text-fg-neutral"
                      }`}
                    >
                      {option.label}
                      {selected && (
                        <span className="text-fg-brand-contrast [&_svg]:size-5" aria-hidden="true">
                          <IconCheckmarkLine />
                        </span>
                      )}
                    </button>
                  );
                })}
              </BottomSheetBody>
            </BottomSheetContent>
          </BottomSheetRoot>

          <span
            role="status"
            aria-live="polite"
            className="truncate text-caption-12-regular tabular-nums text-fg-neutral-muted"
          >
            {metaText}
          </span>
        </div>

        {/* 종류 필터 — 검색 중에는 숨긴다(두 필터가 동시에 걸리면 결과가 왜 비었는지 알 수 없다).
            "종류" 라벨은 달지 않는다 — 칩 자체가 "전체/감자·뿌리/..." 형태라 라벨 없이도 읽힌다. */}
        {!keyword && (
          <RadioChipRoot
            value={group}
            onValueChange={(v) => setGroup(v)}
            aria-label="야채 종류 필터"
            className="-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto overscroll-x-contain px-4 no-scrollbar"
          >
            {/* 칩에 그 종류의 품목 수를 붙인다(예: 잎채소 32) — 누르기 전에 "여기 몇 개나
                있나"를 알 수 있어야 헛걸음(눌렀더니 2종)이 줄어든다. 개수는 지금 데이터에서
                직접 센다(하드코딩하면 품목이 늘 때 어긋난다). */}
            {[ALL, ...VEGETABLE_GROUPS].map((g) => (
              <RadioChipItem key={g} value={g} className="snap-start shrink-0">
                <ChipLabel>
                  {g} {g === ALL ? items.length : items.filter((v) => v.group === g).length}
                </ChipLabel>
              </RadioChipItem>
            ))}
          </RadioChipRoot>
        )}

        {list.length === 0 ? (
          <p className="py-12 text-center text-body-14-regular text-fg-neutral-muted">
            {keyword ? `‘${keyword}’ 검색 결과가 없어요` : "이 종류에 표시할 야채가 없어요"}
          </p>
        ) : (
          <>
            <ul className="grid grid-cols-3 gap-2.5">
              {list.map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/prototype/price/${v.id}`}
                    className="flex h-full flex-col items-center gap-1 rounded-2xl bg-bg-neutral-weak px-2 py-3 active:bg-bg-neutral-weak-pressed"
                  >
                    <VegetableThumb image={v.image} emoji={v.emoji} size="lg" />
                    <span className="line-clamp-1 text-center text-body-14-medium text-fg-neutral">
                      {v.name}
                    </span>
                    {v.price === null ? (
                      <span className="text-caption-12-regular text-fg-neutral-muted">
                        {v.seasonLabel ?? "지금은 비수기"}
                      </span>
                    ) : (
                      <>
                        {/* 단위를 값에 붙인다 — "3,200원"만 있으면 1kg인지 1개인지 몰라
                            품목끼리 비교가 성립하지 않는다(46종의 단위가 kg·개·포기로 섞여 있다). */}
                        <span className="text-body-14-medium tabular-nums text-fg-neutral">
                          {formatNumber(v.price)}원
                          <span className="text-caption-12-regular text-fg-neutral-muted">
                            {" "}
                            /{v.unit}
                          </span>
                        </span>
                        <TrendLabel trend={v.trend} />
                      </>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            {canShowMore && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-bg-neutral-weak text-body-14-medium text-fg-neutral active:bg-bg-neutral-weak-pressed"
              >
                더보기 · {sorted.length - PAGE_SIZE}종 더 보기
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
