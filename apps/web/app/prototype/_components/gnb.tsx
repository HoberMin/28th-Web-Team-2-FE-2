"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import IconHouseFill from "@karrotmarket/react-monochrome-icon/IconHouseFill";
import IconHouseLine from "@karrotmarket/react-monochrome-icon/IconHouseLine";
import IconTrophyFill from "@karrotmarket/react-monochrome-icon/IconTrophyFill";
import IconTrophyLine from "@karrotmarket/react-monochrome-icon/IconTrophyLine";
import IconCartFill from "@karrotmarket/react-monochrome-icon/IconCartFill";
import IconCartLine from "@karrotmarket/react-monochrome-icon/IconCartLine";
import IconPersonFill from "@karrotmarket/react-monochrome-icon/IconPersonFill";
import IconPersonLine from "@karrotmarket/react-monochrome-icon/IconPersonLine";

// GNB(하단 탭바) — 홈/랭킹/장바구니/마이페이지. 탭 루트 화면에만 노출(상세·제보 흐름엔 없음).
//
// 이전엔 텍스트 + 6px 점만으로 현재 탭을 표시해서 4개 중 어디에 있는지 한눈에 안 읽혔다.
// 지금은 세 가지 신호를 함께 준다: 채운/선 아이콘 · 색 · aria-current
// (색 하나에만 의존하지 않는다 — WCAG 1.4.1).
const TABS = [
  { href: "/prototype", label: "홈", Fill: IconHouseFill, Line: IconHouseLine },
  { href: "/prototype/ranking", label: "랭킹", Fill: IconTrophyFill, Line: IconTrophyLine },
  { href: "/prototype/basket", label: "장바구니", Fill: IconCartFill, Line: IconCartLine },
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
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 ${
              active ? "text-fg-neutral" : "text-fg-neutral-subtle"
            }`}
          >
            <span className="[&_svg]:size-6" aria-hidden="true">
              <Icon />
            </span>
            <span className={`text-caption-12-regular ${active ? "font-medium" : ""}`}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
