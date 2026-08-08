import { ListStory } from "../../_components/list-story";
import { RowStory } from "../../_components/row-story";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `list/story` node 186-3208, sync 2026-08-08. 신규 컴포넌트. Variant 없음.
// Figma 심볼 안에는 행이 2개 들어 있지만 그건 샘플 개수라, 개수를 바꿔도 되게 만들었다.
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

const TITLES = [
  "양파 값, 한달 새 12% 내렸어요",
  "장마 끝나고 상추 값이 다시 올랐어요",
  "이번 주 가장 싸진 야채 세 가지",
];

function ListStoryStory() {
  return (
    <div className="flex max-w-90 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">여러 행을 쌓은 모습</p>
        <ListStory label="소식 목록">
          {TITLES.map((title) => (
            <RowStory
              key={title}
              thumbnail={<StoryThumbnail />}
              title={title}
              trailingIcon={<ChevronRightIcon />}
            />
          ))}
        </ListStory>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">한 행만 있을 때</p>
        <ListStory label="소식 목록">
          {[
            <RowStory
              key="only"
              thumbnail={<StoryThumbnail />}
              title="양파 값, 한달 새 12% 내렸어요"
              trailingIcon={<ChevronRightIcon />}
            />,
          ]}
        </ListStory>
      </div>
    </div>
  );
}

export const listStoryStory: Story = {
  id: "list-story",
  title: "List Story",
  group: "컴포넌트",
  figma: "node 186-3208",
  description: "소식 행을 세로로 쌓아 보여 주는 목록이에요.",
  Component: ListStoryStory,
};
