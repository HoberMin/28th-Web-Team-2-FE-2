"use client";

// 홈 상단 검색 — 아이콘만 두고, 누르면 그 자리에서 검색창이 열린다.
//
// 왜 아이콘인가: 홈은 "지금 뭘 해야 하나"를 보여주는 화면이라 입력칸이 상단을 상시 차지하면
// 첫 화면에서 카드 하나가 밀린다. 반대로 이름을 아는 사람에게는 46종 목록을 스크롤하는 게
// 가장 느린 길이라, 진입점 자체는 첫 화면에 있어야 한다 → 접힌 아이콘이 그 타협점이다.
//
// 결과는 품목만 준다(가게·제보 검색 아님). 시세는 여기서 안 보여준다 — 고르면 바로 시세
// 상세로 가므로, 목록에 값을 또 얹으면 같은 숫자를 두 번 읽게 된다.

import { useState } from "react";
import Link from "next/link";
import IconMagnifyingglassLine from "@karrotmarket/react-monochrome-icon/IconMagnifyingglassLine";
import IconXmarkLine from "@karrotmarket/react-monochrome-icon/IconXmarkLine";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { VEGETABLES } from "../_lib/vegetables";
import { matchesVegetableName } from "../_lib/search";
import { VegetableThumb } from "./vegetable-thumb";

/** 결과 최대 노출 — 초성 검색은 후보가 많아, 화면을 덮지 않게 자른다. */
const RESULT_LIMIT = 8;

/** 열림 상태를 부모(홈 헤더)가 알아야 한다 — 검색 중에는 동네 라벨을 접어 폭을 넘겨준다. */
export function HomeSearch({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const keyword = query.trim();

  function toggle(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  function close() {
    toggle(false);
    setQuery("");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => toggle(true)}
        aria-label="야채 검색"
        className="flex size-10 items-center justify-center rounded-full text-content-primary active:bg-gray-100 [&_svg]:size-6"
      >
        <IconMagnifyingglassLine />
      </button>
    );
  }

  const results = keyword
    ? VEGETABLES.filter((veg) => matchesVegetableName(veg.name, keyword)).slice(0, RESULT_LIMIT)
    : [];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-center gap-1">
        <div className="min-w-0 flex-1">
          {/* label은 sr-only가 아니라 seed의 label prop을 쓰면 시각 라벨이 생겨 헤더 한 줄을
              넘긴다 → 여기서는 aria-label만 둔다. 무엇을 치는 칸인지는 placeholder + 바로
              아래 안내 문구("찾는 야채 이름을 입력해 보세요")가 함께 전달한다. */}
          <TextField
            value={query}
            onValueChange={(v) => setQuery(v.value)}
            prefixIcon={<IconMagnifyingglassLine />}
          >
            <TextFieldInput
              placeholder="야채 이름 또는 초성 (예: ㄱㅈ)"
              aria-label="야채 검색"
              autoFocus
              enterKeyHint="search"
            />
          </TextField>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="검색 닫기"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-content-secondary active:bg-gray-100 [&_svg]:size-5"
        >
          <IconXmarkLine />
        </button>
      </div>

      {/* 빈 상태 둘을 구분한다 — 아직 안 친 것(안내)과 쳤는데 없는 것(결과 없음) */}
      {keyword === "" ? (
        <p className="px-1 text-caption-12-regular text-content-secondary">
          찾는 야채 이름을 입력해 보세요
        </p>
      ) : results.length === 0 ? (
        <p role="status" className="px-1 text-caption-12-regular text-content-secondary">
          ‘{keyword}’ 검색 결과가 없어요
        </p>
      ) : (
        <ul className="flex flex-col">
          {results.map((veg) => (
            <li key={veg.id}>
              <Link
                href={`/prototype/price/${veg.id}`}
                onClick={close}
                className="flex h-12 items-center gap-2 border-b border-border-secondary last:border-b-0 active:bg-gray-100"
              >
                <VegetableThumb image={veg.image} emoji={veg.emoji} size="sm" />
                <span className="truncate text-body-14-medium text-content-primary">{veg.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
