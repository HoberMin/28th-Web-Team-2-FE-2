import { ImageVegetableOnion } from "../../_components/image-vegetable-onion";
import type { Story } from "./types";

// Figma `image/vegetable-onion` node 185-1654, sync 2026-08-08. Variant 없음.
const SIZES = [
  { className: "size-12", label: "48 (기본)" },
  { className: "size-10", label: "40" },
];

function ImageVegetableOnionStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">실제로 쓰이는 크기</p>
        <div className="flex flex-wrap items-end gap-6">
          {SIZES.map(({ className, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <ImageVegetableOnion className={className} />
              <span className="text-caption-12-regular text-content-secondary">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-caption-12-regular text-content-secondary">
          기본은 48이고, 목록 줄에서는 40으로 줄여 써요. 그림이 칸보다 크면 칸 밖은 잘려요.
        </p>
      </div>
    </div>
  );
}

export const imageVegetableOnionStory: Story = {
  id: "image-vegetable-onion",
  title: "Image Vegetable",
  group: "컴포넌트",
  figma: "node 185-1654",
  description: "야채 그림을 담는 정사각형 칸이에요.",
  Component: ImageVegetableOnionStory,
};
