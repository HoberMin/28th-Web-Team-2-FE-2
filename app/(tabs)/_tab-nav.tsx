"use client";

import { usePathname } from "next/navigation";
import { NavGnb, type NavGnbItem } from "../_components/nav-gnb";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "../_lib/routes";

// GNB를 감싸는 유일한 클라이언트 leaf. 활성 항목 판정에 현재 경로가 필요해서만 "use client"다
// (conventions #10 — 지시어는 정말 필요한 잎에만).
//
// 아이콘은 `currentColor`로 받는다 — NavGnb가 활성/비활성에 따라 아이콘은
// `content/primary`↔`content/disabled`, 라벨은 `content/primary`↔`content/secondary`로
// 나눠 적용한다.
//
// ⚠️ 그래서 **가게 탭은 원본 색이 사라진다.** `store-fill.svg`는 `fill="#262F3C"`인데
//    마스크로 그리면 GNB 텍스트 색으로 대체된다. 홈·찜은 원본이 `#262F3C`라 content/primary와
//    같아서 차이가 없다. 활성/비활성 전환이 필요한 자리라 `currentColor`가 맞지만,
//    nav/gnb의 가게 아이콘이 원래 초록인지는 **디자이너 확인 대기**다.
//
const ITEMS: NavGnbItem[] = [
  { href: ROUTES.home, label: "홈", icon: <FigmaIcon name="home" width={24} currentColor /> },
  {
    href: ROUTES.prices,
    label: "야채 시세",
    icon: <FigmaIcon name="chart-up" width={24} currentColor />,
  },
  {
    href: ROUTES.stores,
    label: "가게",
    icon: <FigmaIcon name="store-fill" width={24} currentColor />,
  },
  { href: ROUTES.saved, label: "찜", icon: <FigmaIcon name="heart-fill" width={24} currentColor /> },
  { href: ROUTES.mypage, label: "내 정보", icon: <FigmaIcon name="person-fill" width={24} currentColor /> },
];

export function TabNav() {
  const pathname = usePathname();

  // 홈만 정확히 일치로, 나머지는 하위 경로까지 활성으로 본다.
  const activeHref =
    ITEMS.find((item) => item.href !== ROUTES.home && pathname.startsWith(item.href))?.href ??
    (pathname === ROUTES.home ? ROUTES.home : undefined);

  return <NavGnb items={ITEMS} activeHref={activeHref} />;
}
