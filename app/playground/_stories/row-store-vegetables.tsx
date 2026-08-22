import { RowStoreVegetables } from "../../_components/row-store-vegetables";
import { FigmaImage } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `row/store-vegetables` node 185-2042, sync 2026-08-08 · **재sync 2026-08-22(QA-V3)**.
// 신규 컴포넌트. Variant 없음.
// Figma 샘플은 야채 5개 + "+7" 배지지만 개수는 고정이 아니라 바꿀 수 있게 만들었다.
// 08-22 변경: 루트 정렬이 `justify-between` → **gap 6px 좌측 정렬**. 아래 "남은 게 없을 때"
// 스토리(3개)가 그 차이를 보는 자리다 — 예전엔 3개가 줄 전체로 흩어졌다.
//
function VegetableImage() {
  return (
    <FigmaImage name="onion.png" width={48} height={48} className="size-12 object-contain" />
  );
}

const NAMES = ["양파", "대추방울토마토", "얼갈이배추", "새송이버섯", "고춧가루(중국산)"];

function toItems(names: string[]) {
  return names.map((name) => ({ name, visual: <VegetableImage /> }));
}

function RowStoreVegetablesStory() {
  return (
    <div className="flex max-w-80 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">기본</p>
        <RowStoreVegetables items={toItems(NAMES)} moreCount={7} />
        <p className="text-caption-12-regular text-content-secondary">
          이름이 두 줄인 야채가 섞여 있어도 줄 높이가 일정하게 유지돼요.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">남은 게 없을 때</p>
        <RowStoreVegetables items={toItems(NAMES.slice(0, 3))} />
        <p className="text-caption-12-regular text-content-secondary">
          더 보여 줄 야채가 없으면 끝의 +N 배지를 그리지 않아요. 개수가 적어도 6px 간격으로
          왼쪽에 붙어요(Figma 08-22 수정본).
        </p>
      </div>
    </div>
  );
}

export const rowStoreVegetablesStory: Story = {
  id: "row-store-vegetables",
  title: "Row Store Vegetables",
  group: "컴포넌트",
  figma: "node 185-2042",
  description: "한 가게가 파는 야채를 한 줄로 늘어놓고, 넘치면 남은 개수를 알려 줘요.",
  Component: RowStoreVegetablesStory,
};
