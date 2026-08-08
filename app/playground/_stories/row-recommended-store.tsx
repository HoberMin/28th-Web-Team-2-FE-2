import { RowRecommendedStore } from "../../_components/row-recommended-store";
import { FigmaIcon } from "./figma-asset";
import type { Story } from "./types";

// Figma `row/recommended-store` node 185-2117, sync 2026-08-08. Variant 없음.
//
function StoreIcon() {
  return <FigmaIcon name="store-fill-recommended-20" width={20} />;
}

function ChevronRightIcon() {
  return <FigmaIcon name="chevron-right-recommended-20" width={20} />;
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
