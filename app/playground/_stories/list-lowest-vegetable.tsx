import { ListLowestVegetable } from "../../_components/list-lowest-vegetable";
import type { Story } from "./types";

// Figma `list/lowest-vegetable` node 227-3463, sync 2026-08-08. 신규 컴포넌트. Variant 없음.
// Figma 심볼은 행 하나뿐이라(이름은 list이지만 안에 반복 구조가 없다) 여기서는 여러 줄을 쌓아
// 순위가 이어지는 모습까지 보여 준다.
//
// ⚠️ 야채 그림·가게 아이콘·방향 화살표는 Figma 에셋을 가져올 수 없어 임시 표시로 대신했다.

function VisualPlaceholder() {
  return (
    <span className="flex size-10 items-center justify-center rounded-full bg-surface-secondary text-caption-12-regular text-content-disabled">
      그림
    </span>
  );
}

function StoreIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 6.5V13h11V6.5" />
      <path d="M2 3h12l.8 3.1a2 2 0 0 1-3.9.5 2 2 0 0 1-3.9 0 2 2 0 0 1-3.9-.5L2 3Z" />
    </svg>
  );
}

function TrendDownIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M8 12 3.5 6h9L8 12Z" />
    </svg>
  );
}

const ROWS = [
  { name: "양파", storeName: "농협하나로마트", price: "24,900원" },
  { name: "대추방울토마토", storeName: "행복슈퍼마켓", price: "8,500원" },
  { name: "고춧가루(중국산)", storeName: "우리동네청과", price: "132,000원" },
];

function ListLowestVegetableStory() {
  return (
    <div className="flex max-w-90 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">순위대로 쌓은 모습</p>
        <div className="flex flex-col">
          {ROWS.map((row, index) => (
            <ListLowestVegetable
              key={row.name}
              rank={index + 1}
              visual={<VisualPlaceholder />}
              name={row.name}
              storeIcon={<StoreIcon />}
              storeName={row.storeName}
              price={row.price}
              unit="/100kg"
              trendAmount="100,000원"
              trendPercent="(-7.4%)"
              trendIcon={<TrendDownIcon />}
            />
          ))}
        </div>
        <p className="text-caption-12-regular text-content-secondary">
          야채 이름이나 가게 이름이 길면 한 줄에서 …로 줄어들고, 오른쪽 값 자리는 흔들리지 않아요.
        </p>
      </div>
    </div>
  );
}

export const listLowestVegetableStory: Story = {
  id: "list-lowest-vegetable",
  title: "List Lowest Vegetable",
  group: "컴포넌트",
  figma: "node 227-3463",
  description: "가장 싼 야채를 순위와 함께 보여 주는 한 줄이에요.",
  Component: ListLowestVegetableStory,
};
