"use client";

import { useEffect, useState, type ReactNode } from "react";

// UI QA 2026-08-20 #28 — "스크롤하지 않았을 시(초기 진입 시)에도 header/vegetable-detail 떠있음.
// 스크롤하지 않았을 시에는 안 뜨는 것이 맞음(F03_야채시세 상세_동네 제보가_저렴한 순 참고)".
//
// 그래서 헤더의 **배경·구분선·제목**은 스크롤을 시작해야 나타난다.
//
// ⚠️ 단, **뒤로가기 버튼은 항상 보인다.** 헤더 전체를 숨기면 초기 화면에서 이 라우트를 벗어날
//    수단이 사라진다(브라우저 뒤로가기에만 의존하게 되고, 홈 화면에 추가한 PWA·인앱 브라우저에는
//    그 버튼이 없는 경우가 있다). Figma 프레임은 상태별 정지 화면이라 "어떻게 나가는가"를
//    표현하지 않는데, 그 공백을 숨김으로 옮기면 실제로 갇히는 화면이 된다.
//    → 디자이너 확인이 필요한 지점이라 주석으로 남긴다.
//
// 본문이 `overflow-y-auto` 컨테이너라 window 스크롤이 아니다. 그래서 그 컨테이너를 id로 찾아
// passive scroll 리스너를 건다(passive라 스크롤 성능에 영향 없음).

/** 본문 스크롤 컨테이너의 id. `page.tsx`의 `<main>`이 이 값을 단다. */
export const PRICE_DETAIL_SCROLL_ID = "price-detail-scroll";

export interface PriceDetailHeaderProps {
  /** 항상 보이는 뒤로가기 버튼. */
  backButton: ReactNode;
  /** 스크롤 후에만 나타나는 제목 영역. */
  title: ReactNode;
}

export function PriceDetailHeader({ backButton, title }: PriceDetailHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const root = document.getElementById(PRICE_DETAIL_SCROLL_ID);
    if (!root) return;

    const update = () => setScrolled(root.scrollTop > 0);
    update(); // 되돌아온 뒤 스크롤 위치가 복원된 경우를 위해 한 번 즉시 판정한다.
    root.addEventListener("scroll", update, { passive: true });
    return () => root.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={`absolute inset-x-0 top-0 z-20 flex h-12.25 items-center justify-between px-1 transition-colors ${
        scrolled ? "border-b border-border-secondary bg-surface-primary" : "bg-transparent"
      }`}
    >
      {backButton}
      {/*
        제목은 스크롤 전 숨긴다. `invisible`이라 자리(폭)는 유지돼 뒤로가기 버튼과 우측 더미가
        만드는 3분할 정렬이 스크롤 전후로 흔들리지 않는다.
        `aria-hidden`을 같이 걸어 스크린리더가 보이지 않는 제목을 읽지 않게 한다 —
        제목 자체는 본문의 `<h1 className="sr-only">`이 이미 제공한다.
      */}
      <div
        aria-hidden={!scrolled}
        className={`flex min-w-0 items-center gap-1 ${scrolled ? "" : "invisible"}`}
      >
        {title}
      </div>
      <span aria-hidden="true" className="size-12 shrink-0" />
    </header>
  );
}
