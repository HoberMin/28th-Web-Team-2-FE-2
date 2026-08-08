import { RowStory } from "../../_components/row-story";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `row/story` node 186-3196, sync 2026-08-08. 신규 컴포넌트. Variant 없음.
//
function StoryThumbnail() {
  return (
    <FigmaImage
      name="story-thumbnail.png"
      width={48}
      height={48}
      className="size-full object-cover"
    />
  );
}

function ChevronRightIcon() {
  return <FigmaIcon name="chevron-right-row-story-16" width={16} />;
}

function RowStoryStory() {
  return (
    <div className="flex max-w-90 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">기본</p>
        <RowStory
          thumbnail={<StoryThumbnail />}
          title="양파 값, 한달 새 12% 내렸어요"
          trailingIcon={<ChevronRightIcon />}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">제목이 길 때</p>
        <RowStory
          thumbnail={<StoryThumbnail />}
          title="양파 값, 한달 새 12% 내렸어요 그리고 이어지는 아주 긴 제목이 계속됩니다"
          trailingIcon={<ChevronRightIcon />}
        />
        <p className="text-caption-12-regular text-content-secondary">
          제목은 두 줄까지 보이고, 그보다 길면 끝을 …로 줄여요.
        </p>
      </div>
    </div>
  );
}

export const rowStoryStory: Story = {
  id: "row-story",
  title: "Row Story",
  group: "컴포넌트",
  figma: "node 186-3196",
  description: "사진과 제목 한 줄로 된 소식 목록의 한 행이에요.",
  Component: RowStoryStory,
};
