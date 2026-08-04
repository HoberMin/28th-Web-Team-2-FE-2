"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import IconHouseFill from "@karrotmarket/react-monochrome-icon/IconHouseFill";
import IconHouseLine from "@karrotmarket/react-monochrome-icon/IconHouseLine";
import IconTagFill from "@karrotmarket/react-monochrome-icon/IconTagFill";
import IconTagLine from "@karrotmarket/react-monochrome-icon/IconTagLine";
import IconHeartFill from "@karrotmarket/react-monochrome-icon/IconHeartFill";
import IconHeartLine from "@karrotmarket/react-monochrome-icon/IconHeartLine";
import IconStoreFill from "@karrotmarket/react-monochrome-icon/IconStoreFill";
import IconStoreLine from "@karrotmarket/react-monochrome-icon/IconStoreLine";
import IconPersonFill from "@karrotmarket/react-monochrome-icon/IconPersonFill";
import IconPersonLine from "@karrotmarket/react-monochrome-icon/IconPersonLine";

// GNB(하단 탭바) — 홈/야채시세/동네 가게/찜/마이페이지. 탭 루트 화면에만 노출(상세·제보 흐름엔 없음).
//
// 3번째 탭이 랭킹에서 찜으로 바뀌었다(2026-08-04). 랭킹은 탭째로 없앴다 — 경쟁 구도가 제보를
// 늘리는지 확신이 없었고, 제보왕 순위는 보는 사람 대부분에게 자기 얘기가 아니었다. 그 자리에
// 찜을 올린 건 반복 구매가 타깃의 특성이라, 관심 품목·단골 가게로 되돌아오는 경로가 상시로
// 필요해서다(이전엔 마이페이지 하위에 묻혀 있었다).
//
// 2번째 탭 "야채시세"는 2026-07-31 홈 개편으로 신설. 홈(F01)이 "모든 야채 시세를 보는 화면"에서
// "여러 정보를 모아 액션을 유도하는 대시보드"로 역할이 바뀌면서, 46종 전체를 검색·필터로 훑어보는
// 목적은 여기 전용 탭(F01-1)으로 분리했다. 홈에는 인기 품목 미리보기 + 전체보기 링크만 남는다.
//
// 3번째 탭이 장바구니에서 가게로 바뀌었다(2026-07-30, 라벨은 2026-07-31 "동네 가게"로 정리 —
// "매장"이라는 말을 이 화면 포함 전체에서 "가게"로 통일하면서, 탭에서만 "가게" 한 단어로는
// 무엇의 목록인지 짧아 헷갈릴 수 있어 "동네"를 붙였다). 장바구니는 담아둔 목록을 보여줄 뿐이라
// 찜하기와 구별되지 않았고, 사용자의 실제 질문은 "무엇을 담았나"가 아니라 "오늘 어느 가게 갈까"다.
//
// 이전엔 텍스트 + 6px 점만으로 현재 탭을 표시해서 어디에 있는지 한눈에 안 읽혔다.
// 지금은 세 가지 신호를 함께 준다: 채운/선 아이콘 · 색 · aria-current
// (색 하나에만 의존하지 않는다 — WCAG 1.4.1).
const TABS = [
  { href: "/prototype", label: "홈", Fill: IconHouseFill, Line: IconHouseLine },
  { href: "/prototype/vegetables", label: "야채시세", Fill: IconTagFill, Line: IconTagLine },
  { href: "/prototype/stores", label: "동네 가게", Fill: IconStoreFill, Line: IconStoreLine },
  { href: "/prototype/favorites", label: "찜", Fill: IconHeartFill, Line: IconHeartLine },
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
