"use client";

import { usePathname } from "next/navigation";
import { NavGnb, type NavGnbItem } from "../_components/nav-gnb";
import { ROUTES } from "../_lib/routes";

// GNB를 감싸는 유일한 클라이언트 leaf. 활성 항목 판정에 현재 경로가 필요해서만 "use client"다
// (conventions #10 — 지시어는 정말 필요한 잎에만).
//
// ⚠️ 아이콘은 아직 Figma에서 확정 전이다. nav/gnb(223-7003) 인스턴스도 홈만 실제 아이콘이고
//    나머지 4개는 플레이스홀더이며, 에셋 바이트를 코드로 받는 경로도 막혀 있다
//    (figma-bridge §0-0). 임의 아이콘을 그려 넣지 않고 `/playground` nav-gnb 스토리와 같은
//    점선 자리표시로 둔다. 디자이너가 SVG를 전달하면 이 슬롯만 교체하면 된다.
function IconSlot() {
  return <span className="block size-6 rounded-sm border border-border-primary border-dashed" />;
}

const ITEMS: NavGnbItem[] = [
  { href: ROUTES.home, label: "홈", icon: <IconSlot /> },
  { href: ROUTES.prices, label: "시세", icon: <IconSlot /> },
  { href: ROUTES.stores, label: "가게", icon: <IconSlot /> },
  { href: ROUTES.saved, label: "찜", icon: <IconSlot /> },
  { href: ROUTES.mypage, label: "내 정보", icon: <IconSlot /> },
];

export function TabNav() {
  const pathname = usePathname();

  // 홈만 정확히 일치로, 나머지는 하위 경로까지 활성으로 본다.
  const activeHref =
    ITEMS.find((item) => item.href !== ROUTES.home && pathname.startsWith(item.href))?.href ??
    (pathname === ROUTES.home ? ROUTES.home : undefined);

  return <NavGnb items={ITEMS} activeHref={activeHref} />;
}
