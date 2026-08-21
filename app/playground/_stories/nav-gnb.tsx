import { NavGnb } from "../../_components/nav-gnb";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `nav/gnb` node 223-7003, sync 2026-08-05. Variant 없음 — 활성 항목만 바뀐다.
//
// 아이콘은 실화면(`app/(tabs)/_tab-nav.tsx`)과 **같은 구성으로 맞춘다.**

const ITEMS = [
  {
    href: "#gnb-home",
    label: "홈",
    icon: <FigmaIcon name="home" width={24} currentColor />,
  },
  {
    href: "#gnb-price",
    label: "야채 시세",
    icon: <FigmaIcon name="chart-up" width={24} currentColor />,
  },
  {
    href: "#gnb-store",
    label: "가게",
    icon: <FigmaIcon name="store-fill" width={24} currentColor />,
  },
  {
    href: "#gnb-saved",
    label: "찜",
    icon: <FigmaIcon name="heart-fill" width={24} currentColor />,
  },
  {
    href: "#gnb-me",
    label: "내 정보",
    // 실화면(app/(tabs)/_tab-nav.tsx)과 동일 — Figma 인셋을 재현하려 20으로 낮췄다.
    icon: <FigmaIcon name="person-fill" width={24} currentColor />,
  },
];

function NavGnbStory() {
  return (
    <div className="flex flex-col gap-6">
      {ITEMS.filter((item) => item.href === "#gnb-home" || item.href === "#gnb-store").map(
        ({ href, label }) => (
          <div key={href} className="flex flex-col gap-2">
            <div className="max-w-sm overflow-hidden rounded-md border border-border-primary">
              <NavGnb items={ITEMS} activeHref={href} ariaLabel={`주요 메뉴 (${label} 활성)`} />
            </div>
            <p className="text-caption-12-regular text-content-secondary">활성 = {label}</p>
          </div>
        ),
      )}
    </div>
  );
}

export const navGnbStory: Story = {
  id: "nav-gnb",
  title: "Nav GNB",
  group: "컴포넌트",
  figma: "node 223-7003",
  description: "화면 하단에 고정되는 글로벌 내비게이션이에요. 항목 5개, 활성 표시 포함.",
  Component: NavGnbStory,
};
