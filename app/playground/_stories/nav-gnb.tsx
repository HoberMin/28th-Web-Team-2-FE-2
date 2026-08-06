import { NavGnb } from "../../_components/nav-gnb";
import type { Story } from "./types";

// Figma `nav/gnb` node 223-7003, sync 2026-08-05. Variant 없음 — 활성 항목만 바뀐다.
//
// 아이콘은 Figma에서도 아직 확정 전이다(홈만 실제 아이콘, 나머지 4개는 mage:heart-fill
// 플레이스홀더). 에셋을 코드로 가져오는 경로도 막혀 있어(figma-bridge §0-0) 스토리에서는
// 자리만 점선으로 표시한다 — 임의 아이콘을 그려 넣지 않는다.

function IconSlot() {
  return <span className="block size-6 rounded-sm border border-border-primary border-dashed" />;
}

const ITEMS = [
  { href: "#gnb-home", label: "홈", icon: <IconSlot /> },
  { href: "#gnb-price", label: "시세", icon: <IconSlot /> },
  { href: "#gnb-store", label: "가게", icon: <IconSlot /> },
  { href: "#gnb-saved", label: "찜", icon: <IconSlot /> },
  { href: "#gnb-me", label: "내 정보", icon: <IconSlot /> },
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
