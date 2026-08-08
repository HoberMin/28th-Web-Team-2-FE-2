import { BadgeStoreStat } from "../../_components/badge-store-stat";
import type { Story } from "./types";

// Figma `badge/store-stat` node 392-11448, sync 2026-08-08. 신규 컴포넌트.
// Figma 심볼은 2개(metric=affordable · metric=today-report)라 그 2개만 나열한다.
// 라벨 문구는 Figma가 고정해 둔 값이고, 숫자만 바뀐다.

function BadgeStoreStatStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex flex-col items-start gap-2">
          <BadgeStoreStat metric="affordable" count={4} />
          <p className="text-caption-12-regular text-content-secondary">affordable</p>
        </div>
        <div className="flex flex-col items-start gap-2">
          <BadgeStoreStat metric="today-report" count={1} />
          <p className="text-caption-12-regular text-content-secondary">today-report</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">숫자가 커져도</p>
        <div className="flex flex-wrap items-center gap-3">
          <BadgeStoreStat metric="affordable" count={12} />
          <BadgeStoreStat metric="today-report" count={128} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">쓰이는 자리</p>
        <div className="flex w-fit flex-col items-start gap-2 rounded-md border border-border-primary px-3 py-2">
          <span className="text-body-16-semibold text-content-primary">농협하나로마트</span>
          <div className="flex flex-wrap items-center gap-1">
            <BadgeStoreStat metric="affordable" count={4} />
            <BadgeStoreStat metric="today-report" count={1} />
          </div>
        </div>
        <p className="text-caption-12-regular text-content-secondary">
          가게 이름 아래에 나란히 붙어 이 가게의 상황을 한눈에 알려 줘요.
        </p>
      </div>
    </div>
  );
}

export const badgeStoreStatStory: Story = {
  id: "badge-store-stat",
  title: "Badge Store Stat",
  group: "컴포넌트",
  figma: "node 392-11448",
  description: "가게에 저렴한 야채가 몇 개인지, 오늘 제보가 몇 건인지 알리는 배지예요.",
  Component: BadgeStoreStatStory,
};
