"use client";

import { useMemo, useState } from "react";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ButtonChip, ChipLabel } from "seed-design/ui/chip";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetRoot,
  BottomSheetTrigger,
} from "seed-design/ui/bottom-sheet";
import { matchesVegetableName } from "../_lib/search";
import { VEGETABLES } from "../_lib/vegetables";
import type { Vegetable } from "../_lib/types";

// 제보 폼의 품목 선택 시트 — 자유 텍스트 완전일치 대신 46종을 초성 검색으로 고른다(홈 검색 로직 재사용).
// 위치 선택 drawer(LocationPickerSheet)와 같은 생김새(요약 칩 트리거 + 바텀시트)로 통일한다.
export function VegetablePickerSheet({
  value,
  onSelect,
  disabled,
}: {
  value: Vegetable | undefined;
  onSelect: (veg: Vegetable) => void;
  /** 사진 촬영 데모는 감자로 고정 — 시트를 열지 않고 값만 보여준다. */
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => VEGETABLES.filter((v) => matchesVegetableName(v.name, query)),
    [query],
  );

  function choose(veg: Vegetable) {
    onSelect(veg);
    setQuery("");
    setOpen(false);
  }

  const label = value ? `${value.emoji} ${value.name}` : "품목 선택";

  if (disabled) {
    return (
      <ButtonChip type="button" variant="outlineWeak" size="medium" disabled>
        <ChipLabel>{label}</ChipLabel>
      </ButtonChip>
    );
  }

  return (
    <BottomSheetRoot open={open} onOpenChange={setOpen}>
      <BottomSheetTrigger asChild>
        <ButtonChip type="button" variant={value ? "solid" : "outlineStrong"} size="medium">
          <ChipLabel>{label}</ChipLabel>
        </ButtonChip>
      </BottomSheetTrigger>
      <BottomSheetContent title="무엇을 보셨나요?">
        <BottomSheetBody className="flex flex-col gap-3 pb-2">
          <TextField value={query} onValueChange={(v) => setQuery(v.value)} hideCharacterCount>
            <TextFieldInput placeholder="예: 감자, ㄱㅈ" autoFocus aria-label="품목 검색" />
          </TextField>

          <ul className="flex max-h-[50vh] flex-col gap-1 overflow-y-auto overscroll-contain no-scrollbar">
            {results.length === 0 ? (
              <li className="py-8 text-center text-body-14-regular text-fg-neutral-muted">
                &ldquo;{query}&rdquo;와 일치하는 품목이 없어요
              </li>
            ) : (
              results.map((veg) => (
                <li key={veg.id}>
                  <button
                    type="button"
                    onClick={() => choose(veg)}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left active:bg-bg-neutral-weak"
                  >
                    <span className="text-xl" aria-hidden="true">
                      {veg.emoji}
                    </span>
                    <span className="text-body-16-medium text-fg-neutral">{veg.name}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}
