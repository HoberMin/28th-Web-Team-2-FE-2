"use client";

import { useEffect, useState, type ReactNode } from "react";

// UI QA 2026-08-20 #28 — "스크롤하지 않았을 시(초기 진입 시)에도 header/vegetable-detail 떠있음.
// 스크롤하지 않았을 시에는 안 뜨는 것이 맞음(F03_야채시세 상세_동네 제보가_저렴한 순 참고)".
//
// 2026-08-21 재확인 — 처음에는 뒤로가기 버튼만 남겨 뒀는데(이탈 수단이 사라진다는 우려),
// 디자이너가 "header/vegetable-detail 자체가 없어야 한다"고 다시 지정했다.
// Figma [660:14777] 전체 레이아웃을 실제로 열어 보면 상태바 바로 아래에서 썸네일이 시작하고
// 헤더가 아예 없다 — 지시가 맞다. **스크롤 전에는 헤더 전체를 감춘다.**
//
// ⚠️ 다만 완전히 없애지는 않고 `opacity-0 + pointer-events-none`으로 감춘다. 키보드 사용자가
//    Tab을 누르면 `focus-within`으로 다시 드러나므로, 눈에는 시안대로 아무것도 안 보이면서
//    포커스로는 화면을 벗어날 수 있다(WCAG 2.1.2 갇힘 방지). 마우스·터치 사용자에게는
//    시안과 동일하다.
//
// 본문이 `overflow-y-auto` 컨테이너라 window 스크롤이 아니다. 그래서 그 컨테이너를 id로 찾아
// passive scroll 리스너를 건다(passive라 스크롤 성능에 영향 없음).

/** 본문 스크롤 컨테이너의 id. `page.tsx`의 `<main>`이 이 값을 단다. */
export const PRICE_DETAIL_SCROLL_ID = "price-detail-scroll";

/**
 * 헤더 높이(px). Figma `header/vegetable-detail`(639:8119) 실측 **49**.
 *
 * 스크롤하면 이 헤더가 본문 위에 겹쳐 뜨므로, 같이 상단에 고정되는 `tab/bar`는 이만큼
 * 아래에 붙어야 한다 — Figma도 헤더 44~93 · 탭 92~136으로 **위아래로 쌓아** 두었다.
 * 두 값이 어긋나면 탭이 헤더 뒤로 숨는다.
 */
export const PRICE_DETAIL_HEADER_HEIGHT = 49;

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
      className={`absolute inset-x-0 top-0 z-20 flex h-12.25 items-center justify-between px-1 transition-opacity focus-within:pointer-events-auto focus-within:opacity-100 ${
        scrolled
          ? "border-b border-border-secondary bg-surface-primary opacity-100"
          : "pointer-events-none bg-surface-primary opacity-0"
      }`}
    >
      {backButton}
      {/*
        헤더 전체가 스크롤 전에 감춰지므로 제목만 따로 숨길 필요가 없어졌다. `aria-hidden`은
        남긴다 — 보이지 않는 동안 스크린리더가 제목을 두 번 읽지 않게 한다(본문의
        `<h1 className="sr-only">`이 이미 제목을 제공한다).
      */}
      <div aria-hidden={!scrolled} className="flex min-w-0 items-center gap-1">
        {title}
      </div>
      <span aria-hidden="true" className="size-12 shrink-0" />
    </header>
  );
}
