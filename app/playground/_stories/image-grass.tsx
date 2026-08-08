import { ImageGrass } from "../../_components/image-grass";
import type { Story } from "./types";

// Figma `image/grass` node 185-1460, sync 2026-08-08. Variant 없음.
// 카드 바닥에 깔리는 장식이라, 카드 안에 놓인 모습까지 함께 본다.
//
function ImageGrassStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">기본</p>
        <ImageGrass />
        <p className="text-caption-12-regular text-content-secondary">
          왼쪽과 오른쪽 풀이 넓게 떨어져 있어요. 가운데는 비워 두고 카드 내용이 지나가요.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">카드 바닥에 놓인 모습</p>
        <div className="bg-recommended-store relative flex w-89.5 flex-col overflow-hidden rounded-xl px-5 pt-5 pb-12">
          <p className="text-body-16-semibold text-content-primary">카드 내용이 여기 들어가요</p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <ImageGrass height={48} />
          </div>
        </div>
      </div>
    </div>
  );
}

export const imageGrassStory: Story = {
  id: "image-grass",
  title: "Image Grass",
  group: "컴포넌트",
  figma: "node 185-1460",
  description: "카드 아래쪽에 깔리는 장식용 풀 그림이에요.",
  Component: ImageGrassStory,
};
