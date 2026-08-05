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
      <p className="text-caption-12-regular text-content-secondary">
        Figma 규격: surface/primary 배경 + border/primary 상단선, 좌우 20 / 위 12 / 아래 20 여백,
        항목 5개 균등 분배. 활성은 body/14-semibold(content/primary), 비활성은
        body/14-medium(content/secondary)이에요. 점선 네모는 아직 확정 안 된 아이콘 자리예요.
      </p>

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

      <div className="flex flex-col gap-2 rounded-md bg-surface-secondary px-4 py-3">
        <p className="text-body-14-semibold text-content-primary">디자이너 확인이 필요한 것</p>
        <ul className="flex list-disc flex-col gap-1 pl-4 text-caption-12-regular text-content-secondary">
          <li>
            <strong>아이콘 5종이 아직이에요.</strong> Figma에는 홈만 실제 아이콘이고 시세·가게·찜·내
            정보는 하트 플레이스홀더가 꽂혀 있어요. 레이아웃·타이포·색은 확정으로 보고 옮겼고,
            아이콘은 넣는 자리(24×24 슬롯)만 열어 뒀어요.
          </li>
          <li>
            Figma 폭 390px은 모바일 뷰포트 기준이라 코드에선 <code>w-full</code>로 뒀어요. 위
            미리보기는 모바일 폭에 가깝게 감싸 둔 것뿐이라 실제로는 화면 너비를 그대로 따라가요.
          </li>
          <li>
            활성 항목은 굵기·색이 같이 바뀌고 <code>aria-current=&quot;page&quot;</code>도 붙어요 —
            색 하나에만 기대지 않아요. 항목 하나가 약 78×78px이라 터치 영역(44×44)도 넉넉해요.
          </li>
        </ul>
      </div>
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
