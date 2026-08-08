"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SheetSort } from "../../_components/sheet-sort";
import type { SheetSortOption } from "../../_components/sheet-sort";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { buildPricesHref } from "./_href";

// Figma 정렬 트리거(298-3443 프레임) + 정렬시트(298-3575).
//
// Figma와 다르게 한 것:
//   · **폭 고정(w-84px)을 버렸다.** 84는 "가나다순" 글자에만 맞는 값이라 "시세보다 저렴한 순"을
//     고르는 순간 깨진다. hug(내용 폭)로 둔다.
//   · **실제 <button>으로 만들었다.** Figma에는 버튼 정의가 없고 프레임만 있다.
//     시트를 여는 조작이므로 `aria-haspopup="dialog"` + `aria-expanded`를 함께 낸다.
//   · **min-h-11(44px)을 줬다.** Figma 실측 높이는 38px로 권장 터치 타겟에 미달한다.
//     이 화면에서 유일하게 시트를 여는 조작이라 원본 높이 대신 터치 타겟을 택했다.
//     → 이 때문에 정렬 행 전체 높이가 38 → 44로 6px 커진다. 디자이너 확인 필요.
//
// 아이콘은 Figma 원본 SVG(`public/figma/design-library/icons/`)를 쓴다:
//   icon/chevron-down 16×16 — 이 인스턴스(298-3446)는 get_variable_defs가 `content/secondary`를
//     돌려준다. 라이브러리 원본 SVG는 content/primary(#262f3c)로 export돼 있으므로 그대로 두면
//     시안보다 진해진다 → currentColor로 받아 트리거의 content/secondary를 그대로 입힌다.
//   icon/check 20×20 — 선택 행의 색(content/brand/light)을 SheetSort가 정하므로 역시 currentColor.
//
// ⚠️ 대비: content/secondary(#697383) on 흰 배경 5.34:1 → 통과.

export interface PricesSortControlProps {
  options: readonly SheetSortOption[];
  value: string;
  label: string;
  query: string;
  group?: string;
}

export function PricesSortControl({ options, value, label, query, group }: PricesSortControlProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const select = (next: string) => {
    // 고르면 바로 닫는다 — Figma에 확정/취소 버튼이 없어 선택이 곧 확정이다.
    setOpen(false);
    router.replace(buildPricesHref({ q: query, group, sort: next }), { scroll: false });
  };

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`정렬 기준: ${label}`}
        onClick={() => setOpen(true)}
        className="flex min-h-11 shrink-0 items-center gap-1 p-2 text-body-14-medium text-content-secondary"
      >
        <span>{label}</span>
        <FigmaIcon name="chevron-down" width={16} currentColor />
      </button>
      <SheetSort
        open={open}
        onOpenChange={setOpen}
        options={options}
        value={value}
        onSelect={select}
        checkIcon={<FigmaIcon name="check" width={20} currentColor />}
      />
    </>
  );
}
