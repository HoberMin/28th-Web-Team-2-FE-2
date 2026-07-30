"use client";

import { useState } from "react";
import Link from "next/link";
import IconMagnifyingglassLine from "@karrotmarket/react-monochrome-icon/IconMagnifyingglassLine";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ChipLabel, RadioChipItem, RadioChipRoot } from "seed-design/ui/chip";
import type { HomeVegetableItem } from "../_lib/home-data";
import { VEGETABLE_GROUPS } from "../_lib/vegetables";
import { formatNumber } from "../_lib/format";
import { matchesVegetableName } from "../_lib/search";
import { TrendLabel } from "./trend-label";
import { VegetableThumb } from "./vegetable-thumb";

const ALL = "전체";

// 검색 + 그룹 필터 + 야채 그리드.
// 46종을 3열에 그대로 쏟으면 16줄이라 홈이 스크롤에 잠긴다 → 그룹 칩으로 한 화면 분량으로 줄인다.
// 데이터는 서버(getHomeData)에서 조립해 props로 받는다 — 시세·등락 계산은 클라에서 하지 않는다.
export function HomeVegetables({ items }: { items: HomeVegetableItem[] }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>(ALL);
  const keyword = query.trim();

  // 검색어가 있으면 그룹 필터를 무시한다 — 이름을 아는 사람은 이미 목적지가 있다.
  const list = keyword
    ? items.filter((v) => matchesVegetableName(v.name, keyword))
    : group === ALL
      ? items
      : items.filter((v) => v.group === group);

  return (
    <div className="flex flex-col gap-4">
      <TextField
        value={query}
        onValueChange={(v) => setQuery(v.value)}
        prefixIcon={<IconMagnifyingglassLine />}
      >
        <TextFieldInput placeholder="야채 이름 또는 초성으로 검색 (예: ㄱㅈ)" aria-label="야채 검색" />
      </TextField>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-head2-16 text-fg-neutral">{keyword ? "검색 결과" : "야채 시세"}</h2>
          <span className="text-caption-12-regular tabular-nums text-fg-neutral-subtle">
            {list.length}종 · 어제 대비
          </span>
        </div>

        {/* 그룹 필터 — 검색 중에는 숨긴다(두 필터가 동시에 걸리면 결과가 왜 비었는지 알 수 없다) */}
        {!keyword && (
          <RadioChipRoot
            value={group}
            onValueChange={(v) => setGroup(v)}
            aria-label="야채 종류 필터"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
          >
            {[ALL, ...VEGETABLE_GROUPS].map((g) => (
              <RadioChipItem key={g} value={g} className="shrink-0">
                <ChipLabel>{g}</ChipLabel>
              </RadioChipItem>
            ))}
          </RadioChipRoot>
        )}

        {list.length === 0 ? (
          <p className="py-12 text-center text-body-14-regular text-fg-neutral-subtle">
            {keyword ? `‘${keyword}’ 검색 결과가 없어요` : "이 종류에 표시할 야채가 없어요"}
          </p>
        ) : (
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
                    <span className="text-caption-12-regular text-fg-neutral-subtle">
                      {v.seasonLabel ?? "지금은 비수기"}
                    </span>
                  ) : (
                    <>
                      <span className="text-body-14-medium tabular-nums text-fg-neutral">
                        {formatNumber(v.price)}원
                      </span>
                      <TrendLabel trend={v.trend} />
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
