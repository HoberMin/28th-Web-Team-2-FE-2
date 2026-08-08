import { MarkerStoreMap } from "../../_components/marker-store-map";
import { FigmaIcon } from "./figma-asset";
import type { Story } from "./types";

// Figma `marker/store-map` node 439-7518, sync 2026-08-08. 신규 컴포넌트.
// Figma 심볼은 3개(type=name · favorite · icon)라 그 3개만 나열한다.
//
// 배경 규약(design-guide §1-1)상 스토리 배경은 흰색 고정이라, 지도 위에 놓인 느낌은
// 회색 판을 깔아 대신 보여 준다. 마커 자체의 색은 바꾸지 않았다.

function StorePinIcon() {
  return <FigmaIcon name="store-fill-marker-24" width={24} height={23} />;
}

function HeartFillIcon() {
  return <FigmaIcon name="heart-fill-marker-16" width={16} />;
}

function MarkerStoreMapStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">세 가지 모습</p>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-1.5">
            <MarkerStoreMap type="icon" label="농협하나로마트" icon={<StorePinIcon />} />
            <span className="text-caption-12-regular text-content-secondary">icon</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <MarkerStoreMap type="name" label="농협하나로마트" />
            <span className="text-caption-12-regular text-content-secondary">name</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <MarkerStoreMap type="favorite" label="농협하나로마트" icon={<HeartFillIcon />} />
            <span className="text-caption-12-regular text-content-secondary">favorite</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">이름이 길 때</p>
        <MarkerStoreMap type="favorite" label="농협하나로마트 신중동역점 지하1층" icon={<HeartFillIcon />} />
        <p className="text-caption-12-regular text-content-secondary">
          일정 너비를 넘으면 한 줄에서 …로 줄어들어요.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">지도 위에 놓인 모습</p>
        <div className="flex w-fit flex-wrap items-center gap-4 rounded-lg bg-surface-secondary p-6">
          <MarkerStoreMap type="icon" label="우리동네청과" icon={<StorePinIcon />} />
          <MarkerStoreMap type="name" label="행복슈퍼마켓" />
          <MarkerStoreMap type="favorite" label="농협하나로마트" icon={<HeartFillIcon />} />
        </div>
      </div>
    </div>
  );
}

export const markerStoreMapStory: Story = {
  id: "marker-store-map",
  title: "Marker Store Map",
  group: "컴포넌트",
  figma: "node 439-7518",
  description: "지도 위에 가게 위치를 알리는 마커예요. 아이콘만·이름·찜한 가게 세 가지가 있어요.",
  Component: MarkerStoreMapStory,
};
