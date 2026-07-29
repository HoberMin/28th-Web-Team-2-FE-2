"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// GNB(하단 탭바) — 홈/랭킹/장바구니/마이페이지. 탭 루트 화면에만 노출(상세·제보 흐름엔 없음).
const TABS = [
  { href: "/prototype", label: "홈" },
  { href: "/prototype/ranking", label: "랭킹" },
  { href: "/prototype/basket", label: "장바구니" },
  { href: "/prototype/mypage", label: "마이페이지" },
] as const;

export function GNB() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="flex h-16 shrink-0 items-center border-t border-bg-neutral-weak bg-bg-layer-default"
    >
      {TABS.map((tab) => {
        const active = tab.href === "/prototype" ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-1"
          >
            <span
              className={`size-1.5 rounded-full ${active ? "bg-fg-brand" : "bg-transparent"}`}
              aria-hidden="true"
            />
            <span
              className={`text-caption-12-regular ${active ? "text-fg-neutral font-medium" : "text-fg-neutral-subtle"}`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
