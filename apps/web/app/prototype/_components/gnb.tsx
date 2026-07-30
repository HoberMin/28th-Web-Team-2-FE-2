"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import IconHouseFill from "@karrotmarket/react-monochrome-icon/IconHouseFill";
import IconHouseLine from "@karrotmarket/react-monochrome-icon/IconHouseLine";
import IconTrophyFill from "@karrotmarket/react-monochrome-icon/IconTrophyFill";
import IconTrophyLine from "@karrotmarket/react-monochrome-icon/IconTrophyLine";
import IconStoreFill from "@karrotmarket/react-monochrome-icon/IconStoreFill";
import IconStoreLine from "@karrotmarket/react-monochrome-icon/IconStoreLine";
import IconPersonFill from "@karrotmarket/react-monochrome-icon/IconPersonFill";
import IconPersonLine from "@karrotmarket/react-monochrome-icon/IconPersonLine";

// GNB(하단 탭바) — 홈/랭킹/매장/마이페이지. 탭 루트 화면에만 노출(상세·제보 흐름엔 없음).
//
// 3번째 탭이 장바구니에서 매장으로 바뀌었다(2026-07-30). 장바구니는 담아둔 목록을 보여줄 뿐이라
// 찜하기와 구별되지 않았고, 사용자의 실제 질문은 "무엇을 담았나"가 아니라 "오늘 어느 가게 갈까"다.
//
// 이전엔 텍스트 + 6px 점만으로 현재 탭을 표시해서 4개 중 어디에 있는지 한눈에 안 읽혔다.
// 지금은 세 가지 신호를 함께 준다: 채운/선 아이콘 · 색 · aria-current
// (색 하나에만 의존하지 않는다 — WCAG 1.4.1).
const TABS = [
  { href: "/prototype", label: "홈", Fill: IconHouseFill, Line: IconHouseLine },
  { href: "/prototype/ranking", label: "랭킹", Fill: IconTrophyFill, Line: IconTrophyLine },
  { href: "/prototype/stores", label: "매장", Fill: IconStoreFill, Line: IconStoreLine },
  { href: "/prototype/mypage", label: "마이페이지", Fill: IconPersonFill, Line: IconPersonLine },
] as const;

export function GNB() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="flex h-16 shrink-0 items-stretch border-t border-bg-neutral-weak bg-bg-layer-default"
    >
      {TABS.map((tab) => {
        const active = tab.href === "/prototype" ? pathname === tab.href : pathname.startsWith(tab.href);
        const Icon = active ? tab.Fill : tab.Line;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-0.5"
          >
            {/* 브랜드색은 아이콘에만 — 12px 라벨에 쓰면 3.99:1로 AA(4.5)를 못 넘긴다.
                아이콘은 비-텍스트라 3:1 기준이고 3.99로 통과한다.
                활성 신호는 색 하나가 아니라 셋이다: 채운 아이콘 · 색 · 굵기 (+aria-current) */}
            <span
              className={`[&_svg]:size-6 ${active ? "text-fg-brand-contrast" : "text-fg-neutral-muted"}`}
              aria-hidden="true"
            >
              <Icon />
            </span>
            <span
              className={`text-caption-12-regular ${
                active ? "font-medium text-fg-neutral" : "text-fg-neutral-muted"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
