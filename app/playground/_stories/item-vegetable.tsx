import { ItemVegetable } from "../../_components/item-vegetable";
import { FigmaImage } from "./figma-asset";
import type { Story } from "./types";

// Figma `item/vegetable` node 185-1520, sync 2026-08-08. 신규 컴포넌트. Variant 없음.
//
function VegetableImage() {
  return (
    <FigmaImage name="onion.png" width={48} height={48} className="size-12 object-contain" />
  );
}

const NAMES = ["양파", "얼갈이배추", "고춧가루(중국산)"];

function ItemVegetableStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">이름 길이에 따라</p>
        <div className="flex flex-wrap items-start gap-6">
          {NAMES.map((name) => (
            <ItemVegetable key={name} visual={<VegetableImage />} name={name} />
          ))}
        </div>
        <p className="text-caption-12-regular text-content-secondary">
          이름이 길면 두 줄까지 보이고, 그보다 길면 잘려요. 칸 너비는 항상 같아서 여러 개를 늘어놓아도
          줄이 흐트러지지 않아요.
        </p>
      </div>
    </div>
  );
}

export const itemVegetableStory: Story = {
  id: "item-vegetable",
  title: "Item Vegetable",
  group: "컴포넌트",
  figma: "node 185-1520",
  description: "야채 그림 하나와 이름으로 된 가장 작은 단위예요.",
  Component: ItemVegetableStory,
};
