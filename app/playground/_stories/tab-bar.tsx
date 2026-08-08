import { TabBar } from "../../_components/tab-bar";
import type { Story } from "./types";

// Figma `tab/bar` node 298-3578 · 298-3596 (F04 찜 화면 인스턴스), sync 2026-08-08.
// Variant 축은 자식 `tab/item`의 `status`(selected · default) 하나 — 두 상태를 모두 나열한다.
//
// 아이콘 없는 규격이라 슬롯이 없다. 실제 화면에서는 URL 쿼리를 바꾸는 링크지만, 스토리에서는
// 페이지 이동이 일어나지 않도록 앵커(#)를 쓴다.

const ITEMS = [
  { href: "#tab-bar-vegetable", label: "야채" },
  { href: "#tab-bar-store", label: "가게" },
];

function TabBarStory() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-caption-12-regular text-content-secondary">
        선택된 항목만 밑줄이 진해져요(border/tertiary). 밑줄은 화면 끝까지 가지 않고 좌우 16px을
        남기는 게 Figma 원본이에요.
      </p>

      {ITEMS.map(({ href, label }) => (
        <div key={href} className="flex flex-col gap-2">
          <div className="max-w-sm px-4">
            <TabBar items={ITEMS} activeHref={href} ariaLabel={`찜 탭 (${label} 선택)`} />
          </div>
          <p className="text-caption-12-regular text-content-secondary">선택 = {label}</p>
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">확인이 필요한 점</p>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-caption-12-regular text-content-secondary">
          <li>비선택 라벨 색(content/disabled)은 흰 배경 대비 1.92:1로 AA 기준(4.5:1)에 못 미쳐요.</li>
          <li>아이템 높이가 43px이라 권장 터치 타겟 44px보다 1px 작아요.</li>
        </ul>
      </div>
    </div>
  );
}

export const tabBarStory: Story = {
  id: "tab-bar",
  title: "Tab Bar",
  group: "컴포넌트",
  figma: "node 298-3578",
  description: "화면 안에서 목록을 두 갈래로 가르는 상단 탭이에요. 선택·비선택 두 상태가 있어요.",
  Component: TabBarStory,
};
