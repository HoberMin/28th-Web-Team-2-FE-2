import { NavGnb } from "../../_components/nav-gnb";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `nav/gnb` node 223-7003, sync 2026-08-05. Variant 없음 — 활성 항목만 바뀐다.
//
// 아이콘은 실화면(`app/(tabs)/_tab-nav.tsx`)과 **같은 구성으로 맞춘다.** 검산면이 실화면과
// 다르면 여기서 확인하는 의미가 없다(design-guide §1-1).
//   · 홈·가게·찜  → 전달된 에셋 연결
//   · 시세·내 정보 → **글리프가 아직 없다.** 2026-08-08 전달분(28종)에 안 들어왔고 Figma
//                    원본도 `icon/home` 플레이스홀더 상태다. 임의 아이콘을 그리지 않고
//                    점선 자리로 둔다 (GUI피드백 29·30번)

/** 아직 전달되지 않은 아이콘 자리. 실화면과 같은 표시다. */
function IconSlot() {
  return <span className="block size-6 rounded-sm border border-border-primary border-dashed" />;
}

const ITEMS = [
  {
    href: "#gnb-home",
    label: "홈",
    icon: <FigmaIcon name="home" width={24} currentColor />,
  },
  {
    href: "#gnb-price",
    label: "시세",
    icon: <IconSlot />,
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
    icon: <IconSlot />,
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
