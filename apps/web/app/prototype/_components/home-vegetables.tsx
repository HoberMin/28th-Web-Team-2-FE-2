"use client";

import { useState } from "react";
import Link from "next/link";
import IconMagnifyingglassLine from "@karrotmarket/react-monochrome-icon/IconMagnifyingglassLine";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { VEGETABLES } from "../_lib/vegetables";

// 검색 + 인기 야채 그리드 (검색이 그리드를 필터하므로 한 클라이언트 컴포넌트).
export function HomeVegetables() {
  const [query, setQuery] = useState("");
  const keyword = query.trim();
  const list = keyword ? VEGETABLES.filter((v) => v.name.includes(keyword)) : VEGETABLES;

  return (
    <div className="flex flex-col gap-5">
      <TextField
        value={query}
        onValueChange={(v) => setQuery(v.value)}
        suffixIcon={<IconMagnifyingglassLine />}
      >
        <TextFieldInput aria-label="야채 검색" placeholder="시세가 궁금한 야채를 검색해 보세요" />
      </TextField>

      <div className="flex flex-col gap-3">
        <h2 className="text-head2-16 text-fg-neutral">{keyword ? "검색 결과" : "인기 야채"}</h2>

        {list.length === 0 ? (
          <p className="py-12 text-center text-body-14-regular text-fg-neutral-subtle">
            &lsquo;{keyword}&rsquo; 검색 결과가 없어요
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-x-3 gap-y-4">
            {list.map((v) => (
              <li key={v.id}>
                <Link
                  href={`/prototype/price/${v.id}`}
                  className="flex flex-col items-center gap-2 rounded-2xl py-3 hover:bg-bg-neutral-weak"
                >
                  <span
                    className="flex size-16 items-center justify-center rounded-2xl bg-bg-neutral-weak text-3xl"
                    aria-hidden="true"
                  >
                    {v.emoji}
                  </span>
                  <span className="text-body-14-medium text-fg-neutral">{v.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
