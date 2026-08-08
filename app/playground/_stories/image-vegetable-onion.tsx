import { ImageVegetableOnion } from "../../_components/image-vegetable-onion";
import type { Story } from "./types";

// Figma `image/vegetable-onion` node 185-1654, sync 2026-08-08. Variant 없음.
// 그림을 담는 최소 래퍼라서, 실제 그림 대신 자리표시를 넣어 크기와 잘림만 보여 준다.
//
// ⚠️ 실제 양파 그림은 Figma 에셋을 코드로 가져올 수 없어(에셋 다운로드 차단) 비워 뒀다.

function Placeholder() {
  return (
    <span className="flex size-full items-center justify-center bg-surface-secondary text-caption-12-regular text-content-disabled">
      그림
    </span>
  );
}

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
              <ImageVegetableOnion className={className}>
                <Placeholder />
              </ImageVegetableOnion>
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
