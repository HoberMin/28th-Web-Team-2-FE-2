import { RowRecommendedStore } from "../../_components/row-recommended-store";
import type { Story } from "./types";

// Figma `row/recommended-store` node 185-2117, sync 2026-08-08. Variant 없음.
//
// ⚠️ 가게 아이콘·화살표는 Figma 에셋을 코드로 가져올 수 없어 임시 도형으로 대신했다.

function StoreIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M2.5 3.5h15l.9 3.6a2.7 2.7 0 0 1-5.1.7 2.7 2.7 0 0 1-5 0 2.7 2.7 0 0 1-5.1-.7l.9-3.6Z" />
      <path d="M3.8 9.4V17h12.4V9.4a3.9 3.9 0 0 1-2.5-.5 3.9 3.9 0 0 1-5 0 3.9 3.9 0 0 1-4.9.5Z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m7.5 4 6 6-6 6" />
    </svg>
  );
}

function RowRecommendedStoreStory() {
  return (
    <div className="flex max-w-80 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">기본</p>
        <RowRecommendedStore
          storeIcon={<StoreIcon />}
          name="농협하나로마트"
          distance="460m"
          summaryLabel="공공 시세보다 저렴한 야채"
          summaryValue="12가지"
          trailingIcon={<ChevronRightIcon />}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">가게 이름이 길 때</p>
        <RowRecommendedStore
          storeIcon={<StoreIcon />}
          name="농협하나로마트 신중동역점 지하1층"
          distance="1.2km"
          summaryLabel="공공 시세보다 저렴한 야채"
          summaryValue="3가지"
          trailingIcon={<ChevronRightIcon />}
        />
        <p className="text-caption-12-regular text-content-secondary">
          이름이 길어도 거리 표시가 밀려나지 않게, 이름 쪽만 …로 줄어들어요.
        </p>
      </div>
    </div>
  );
}

export const rowRecommendedStoreStory: Story = {
  id: "row-recommended-store",
  title: "Row Recommended Store",
  group: "컴포넌트",
  figma: "node 185-2117",
  description: "추천 가게 한 줄이에요. 이름·거리와 저렴한 야채가 몇 가지인지 알려 줘요.",
  Component: RowRecommendedStoreStory,
};
