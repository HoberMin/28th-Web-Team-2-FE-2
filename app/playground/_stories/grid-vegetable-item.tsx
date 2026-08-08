import { GridVegetableItem } from "../../_components/grid-vegetable-item";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `grid/vegetable-item` node 237-11384, sync 2026-08-08. 신규 컴포넌트.
// Figma 심볼은 2개(favorite=false · favorite=true)라 그 2개를 나열하고, 격자에 깔린 모습도 함께 본다.
//
function VegetableImage() {
  return (
    <FigmaImage
      name="vegetable-grid.png"
      width={110}
      height={110}
      className="size-full object-cover"
    />
  );
}

function HeartOutlineIcon() {
  return <FigmaIcon name="heart-stroke-grid-24" width={24} />;
}

function HeartFillIcon() {
  return <FigmaIcon name="heart-fill-grid-24" width={24} />;
}

function TrendDownIcon() {
  return <FigmaIcon name="trend-down" width={16} />;
}

const SHARED = {
  visual: <VegetableImage />,
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
