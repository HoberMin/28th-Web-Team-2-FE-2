"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "../../_components/text-field";
import { buildPricesHref } from "./_href";
import { CloseFillIcon, SearchIcon } from "./_icons";

// Figma `field/text`(298-3433/298-3461) 재사용 — 실측이 기존 컴포넌트와 완전히 일치해
// (h-13 · px-4 py-2 · rounded-lg · surface/secondary) 새로 만들지 않았다.
// normal = placeholder + icon/search, typing = 입력값 + icon/close-fill 이라는 두 변형은
// TextField의 `trailing` 슬롯을 값 유무로 갈아끼워 그대로 재현된다.
//
// 검색어를 로컬 상태가 아니라 **URL 쿼리**로 올린다 — 목록을 서버에서 완성해야 해서다.
// 글자마다 라우팅하면 과하므로 250ms 멈춘 뒤에 한 번만 replace한다(push가 아니라 replace라
// 뒤로가기 히스토리가 글자 수만큼 쌓이지 않는다).
//
// ⚠️ 대비: placeholder content/disabled(#b4bbcb) on surface/secondary(#f2f3f8) = 1.74:1
//    (기준 4.5:1) → 미달. Figma 원본 값을 유지하고 사실만 기록한다.
// ⚠️ 지우기 버튼은 Figma의 24×24 아이콘 자리를 그대로 쓴다 — 권장 터치 타겟 44×44보다 작다.

const DEBOUNCE_MS = 250;

export interface PricesSearchFieldProps {
  /** 현재 URL의 검색어. */
  query: string;
  group?: string;
  sort?: string;
}

export function PricesSearchField({ query, group, sort }: PricesSearchFieldProps) {
  const router = useRouter();
  const [value, setValue] = useState(query);

  // URL이 바깥에서 바뀌면(칩 선택·초기화·뒤로가기) 입력값도 따라간다.
  useEffect(() => {
    setValue(query);
  }, [query]);

  useEffect(() => {
    const next = value.trim();
    if (next === query) return;
    const timer = setTimeout(() => {
      router.replace(buildPricesHref({ q: next, group, sort }), { scroll: false });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, query, group, sort, router]);

  return (
    <div role="search">
      <TextField
        // type="search"를 쓰면 웹킷이 자체 지우기 버튼을 하나 더 그려 Figma의 close 아이콘과 겹친다.
        type="text"
        enterKeyHint="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="찾는 야채 있으신가요?"
        aria-label="야채 검색"
        trailing={
          value ? (
            <button
              type="button"
              aria-label="검색어 지우기"
              onClick={() => setValue("")}
              className="flex size-6 items-center justify-center text-content-disabled"
            >
              <CloseFillIcon />
            </button>
          ) : (
            <span aria-hidden="true" className="text-content-disabled">
              <SearchIcon />
            </span>
          )
        }
      />
    </div>
  );
}
