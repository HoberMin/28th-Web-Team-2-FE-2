"use client";

// 홈 상단 줄 — 왼쪽 동네 라벨(위치 전환), 오른쪽 검색 아이콘.
//
// 검색창이 열리면 동네 라벨을 숨긴다. 390px 폭에서 둘을 같이 두면 입력칸이 절반으로 줄어
// 무엇을 치는 칸인지 안 보인다. 동네는 검색을 닫으면 바로 돌아온다.

import { useState } from "react";
import { LocationLabel } from "./location-label";
import { HomeSearch } from "./home-search";

export function HomeHeader() {
  const [searching, setSearching] = useState(false);

  return (
    <div className="flex min-h-10 items-start gap-2">
      {!searching && (
        <div className="min-w-0 flex-1">
          <LocationLabel />
        </div>
      )}
      <HomeSearch onOpenChange={setSearching} />
    </div>
  );
}
