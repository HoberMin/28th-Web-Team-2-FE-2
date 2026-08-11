import { ImageProfileReporter, type ReporterTone } from "../../_components/image-profile-reporter";
import type { Story } from "./types";

const COLORS: ReporterTone[] = ["green", "orange", "gray", "blue"];

function ImageProfileReporterStory() {
  return (
    <div className="flex gap-4">
      {COLORS.map((color) => (
        <div key={color} className="flex flex-col items-center gap-2">
          <ImageProfileReporter color={color} />
          <span className="text-caption-12-regular text-content-secondary">{color}</span>
        </div>
      ))}
    </div>
  );
}

export const imageProfileReporterStory: Story = {
  id: "image-profile-reporter",
  title: "Image Profile Reporter",
  group: "컴포넌트",
  figma: "node 671-9932",
  description: "댓글 제보자의 44px 프로필 이미지 4색이에요.",
  Component: ImageProfileReporterStory,
};
