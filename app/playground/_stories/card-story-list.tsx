import { CardStoryList } from "../../_components/card-story-list";
import { RowStory } from "../../_components/row-story";
import { FigmaIcon, FigmaImage } from "./figma-asset";
import type { Story } from "./types";

// Figma `card/story-list` node 186-3233, sync 2026-08-08. Variant 없음.
// 심볼 안에는 행이 2개지만 그건 샘플 개수라 바꿀 수 있게 만들었다.
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
];

function CardStoryListStory() {
  return (
    <div className="flex max-w-90 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">기본</p>
        <CardStoryList label="시세 이야기">
          {TITLES.map((title) => (
            <RowStory
              key={title}
              thumbnail={<StoryThumbnail />}
              title={title}
              trailingIcon={<ChevronRightIcon />}
            />
          ))}
        </CardStoryList>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">행이 하나일 때</p>
        <CardStoryList label="시세 이야기" actionLabel="더 보기">
          {[
            <RowStory
              key="only"
              thumbnail={<StoryThumbnail />}
              title="양파 값, 한달 새 12% 내렸어요"
              trailingIcon={<ChevronRightIcon />}
            />,
          ]}
        </CardStoryList>
        <p className="text-caption-12-regular text-content-secondary">
          아래 버튼 문구는 화면에 따라 바꿀 수 있어요.
        </p>
      </div>
    </div>
  );
}

export const cardStoryListStory: Story = {
  id: "card-story-list",
  title: "Card Story List",
  group: "컴포넌트",
  figma: "node 186-3233",
  description: "소식 몇 줄을 카드로 묶고 아래에 더보기 버튼을 붙인 카드예요.",
  Component: CardStoryListStory,
};
