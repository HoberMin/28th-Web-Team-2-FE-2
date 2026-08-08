import { RowStory } from "../../_components/row-story";
import type { Story } from "./types";

// Figma `row/story` node 186-3196, sync 2026-08-08. 신규 컴포넌트. Variant 없음.
//
// ⚠️ 아래 회색 네모(썸네일)와 화살표는 Figma 에셋을 코드로 가져올 수 없어(에셋 다운로드 차단)
// 자리만 표시한 임시 표시다. 화살표는 흔한 모양이라 직접 그려 뒀고, 디자이너가 실제 아이콘을
// 주면 교체한다.
//
// ⚠️ 화살표 색이 Figma(옅은 회색)보다 진하게 보이는 건 의도한 상태다 — 컴포넌트가 색을 정하지
// 않고 상속에 맡기고 있기 때문이다. 어떤 색 토큰인지 Figma에서 특정할 수 없어 임의로 고르지
// 않았다(row-story.tsx 헤더 참고). 디자이너가 확정하면 컴포넌트와 여기가 함께 맞춰진다.

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

function RowStoryStory() {
  return (
    <div className="flex max-w-90 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">기본</p>
        <RowStory
          thumbnail={<ThumbnailPlaceholder />}
          title="양파 값, 한달 새 12% 내렸어요"
          trailingIcon={<ChevronRightIcon />}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">제목이 길 때</p>
        <RowStory
          thumbnail={<ThumbnailPlaceholder />}
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
