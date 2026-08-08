import { GridVegetableItem } from "../../_components/grid-vegetable-item";
import type { Story } from "./types";

// Figma `grid/vegetable-item` node 237-11384, sync 2026-08-08. 신규 컴포넌트.
// Figma 심볼은 2개(favorite=false · favorite=true)라 그 2개를 나열하고, 격자에 깔린 모습도 함께 본다.
//
// ⚠️ 사진과 하트는 Figma 에셋을 코드로 가져올 수 없어(에셋 다운로드 차단) 임시 표시로 대신했다.
// 하트는 button/circle 스토리와 같은 임시 도형이다 — 디자이너가 실제 아이콘을 주면 교체한다.

function VisualPlaceholder() {
  return (
    <span className="flex size-full items-center justify-center text-caption-12-regular text-content-disabled">
      사진
    </span>
  );
}

function HeartOutlineIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="23"
      height="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s-7.5-4.6-10-9.1C.6 8.6 2 5 5.5 5c2 0 3.4 1.1 4.5 2.6C11.1 6.1 12.5 5 14.5 5 18 5 19.4 8.6 22 11.9 19.5 16.4 12 21 12 21Z" />
    </svg>
  );
}

function HeartFillIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-10-9.1C.6 8.6 2 5 5.5 5c2 0 3.4 1.1 4.5 2.6C11.1 6.1 12.5 5 14.5 5 18 5 19.4 8.6 22 11.9 19.5 16.4 12 21 12 21Z" />
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

const SHARED = {
  visual: <VisualPlaceholder />,
  price: "249,090원",
  unit: "/100kg",
  trendAmount: "100,000원",
  trendPercent: "(-7.4%)",
  trendIcon: <TrendDownIcon />,
};

function GridVegetableItemStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">두 가지 모습</p>
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col items-start gap-1.5">
            <GridVegetableItem
              {...SHARED}
              name="오이"
              favorite={false}
              favoriteIcon={<HeartOutlineIcon />}
            />
            <span className="text-caption-12-regular text-content-secondary">찜 안 함</span>
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <GridVegetableItem
              {...SHARED}
              name="오이"
              favorite
              favoriteIcon={<HeartFillIcon />}
            />
            <span className="text-caption-12-regular text-content-secondary">찜함</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">격자에 깔린 모습</p>
        <div className="grid w-fit grid-cols-2 gap-4 md:grid-cols-3">
          {["오이", "양파", "대추방울토마토", "얼갈이배추"].map((name, index) => (
            <GridVegetableItem
              key={name}
              {...SHARED}
              name={name}
              favorite={index % 2 === 1}
              favoriteIcon={index % 2 === 1 ? <HeartFillIcon /> : <HeartOutlineIcon />}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const gridVegetableItemStory: Story = {
  id: "grid-vegetable-item",
  title: "Grid Vegetable Item",
  group: "컴포넌트",
  figma: "node 237-11384",
  description: "격자에 깔리는 야채 카드예요. 사진·이름·가격·등락과 찜 표시가 들어가요.",
  Component: GridVegetableItemStory,
};
