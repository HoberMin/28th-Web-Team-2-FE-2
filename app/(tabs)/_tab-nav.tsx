"use client";

import { usePathname } from "next/navigation";
import { NavGnb, type NavGnbItem } from "../_components/nav-gnb";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "../_lib/routes";

// GNB를 감싸는 유일한 클라이언트 leaf. 활성 항목 판정에 현재 경로가 필요해서만 "use client"다
// (conventions #10 — 지시어는 정말 필요한 잎에만).
//
// 아이콘은 `currentColor`로 받는다 — NavGnb가 활성/비활성에 따라 `content/primary`↔
// `content/secondary`를 텍스트 색으로 주고, 아이콘이 그 색을 그대로 따라야 하기 때문이다.
//
// ⚠️ 그래서 **가게 탭은 원본 색이 사라진다.** `store-fill.svg`는 `fill="#064E35"`(진초록)인데
//    마스크로 그리면 GNB 텍스트 색으로 대체된다. 홈·찜은 원본이 `#262F3C`라 content/primary와
//    같아서 차이가 없다. 활성/비활성 전환이 필요한 자리라 `currentColor`가 맞지만,
//    nav/gnb의 가게 아이콘이 원래 초록인지는 **디자이너 확인 대기**다.
//
// ⚠️ **시세·내 정보 탭 글리프가 아직 없다.** 2026-08-08 에셋 전달분(28종)에 홈·가게·찜만
//    들어왔다. Figma 원본의 nav/gnb도 이 두 자리가 `icon/home` 플레이스홀더 상태다.
//    임의 아이콘을 그리지 않고 점선 자리표시로 둔다 — 전달되면 이 두 줄만 바뀐다.
//    (GUI피드백 29·30번: 나머지 2종 + 미선택용 stroke 버전 요청)
function IconSlot() {
  return <span className="block size-6 rounded-sm border border-border-primary border-dashed" />;
}

const ITEMS: NavGnbItem[] = [
  { href: ROUTES.home, label: "홈", icon: <FigmaIcon name="home" width={24} currentColor /> },
  { href: ROUTES.prices, label: "시세", icon: <IconSlot /> },
  {
    href: ROUTES.stores,
    label: "가게",
    icon: <FigmaIcon name="store-fill" width={24} currentColor />,
  },
  { href: ROUTES.saved, label: "찜", icon: <FigmaIcon name="heart-fill" width={24} currentColor /> },
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
