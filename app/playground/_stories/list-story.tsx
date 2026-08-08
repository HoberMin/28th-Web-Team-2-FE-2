import { ListStory } from "../../_components/list-story";
import { RowStory } from "../../_components/row-story";
import type { Story } from "./types";

// Figma `list/story` node 186-3208, sync 2026-08-08. 신규 컴포넌트. Variant 없음.
// Figma 심볼 안에는 행이 2개 들어 있지만 그건 샘플 개수라, 개수를 바꿔도 되게 만들었다.
//
// ⚠️ 썸네일·화살표는 Figma 에셋을 가져올 수 없어 임시 표시로 대신했다(row/story 스토리와 동일).

function ThumbnailPlaceholder() {
  return (
    <span className="flex size-12 items-center justify-center bg-surface-secondary text-caption-12-regular text-content-disabled">
      사진
    </span>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 3 5 5-5 5" />
    </svg>
  );
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
              thumbnail={<ThumbnailPlaceholder />}
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
              thumbnail={<ThumbnailPlaceholder />}
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
