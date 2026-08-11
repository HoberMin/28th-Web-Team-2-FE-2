import { ImageStorePlaceholder } from "../../_components/image-store-placeholder";
import type { Story } from "./types";

function ImageStorePlaceholderStory() {
  return (
    <div className="w-full max-w-97.5 overflow-hidden">
      <ImageStorePlaceholder />
    </div>
  );
}

export const imageStorePlaceholderStory: Story = {
  id: "image-store-placeholder",
  title: "Image Store Placeholder",
  group: "컴포넌트",
  figma: "node 703-13594",
  description: "가게 사진이 아직 준비되지 않았을 때 보여주는 390×220 이미지예요.",
  Component: ImageStorePlaceholderStory,
};
