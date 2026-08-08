import { CardRecommendedStore } from "../../_components/card-recommended-store";
import { ImageGrass } from "../../_components/image-grass";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `card/recommended-store` node 185-2359, sync 2026-08-08. Variant 없음.
//
function StoreIcon() {
  return <FigmaIcon name="store-fill-recommended-20" width={20} />;
}

function ChevronRightIcon() {
  return <FigmaIcon name="chevron-right-recommended-20" width={20} />;
}

function VegetableImage() {
  return (
    <FigmaImage name="onion.png" width={48} height={48} className="size-12 object-contain" />
  );
}

const VEGETABLES = ["양파", "대추방울토마토", "얼갈이배추", "새송이버섯", "고춧가루(중국산)"].map(
  (name) => ({ name, visual: <VegetableImage /> }),
);

function CardRecommendedStoreStory() {
  return (
    <div className="flex max-w-90 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">기본</p>
        <CardRecommendedStore
          storeIcon={<StoreIcon />}
          name="농협하나로마트"
          distance="460m"
          summaryLabel="공공 시세보다 저렴한 야채"
          summaryValue="12가지"
          trailingIcon={<ChevronRightIcon />}
          vegetables={VEGETABLES}
          moreCount={7}
          grass={<ImageGrass />}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">야채가 적을 때</p>
        <CardRecommendedStore
          storeIcon={<StoreIcon />}
          name="행복슈퍼마켓"
          distance="820m"
          summaryLabel="공공 시세보다 저렴한 야채"
          summaryValue="5가지"
          trailingIcon={<ChevronRightIcon />}
          vegetables={VEGETABLES.slice(0, 3)}
          grass={<ImageGrass />}
        />
      </div>
    </div>
  );
}

export const cardRecommendedStoreStory: Story = {
  id: "card-recommended-store",
  title: "Card Recommended Store",
  group: "컴포넌트",
  figma: "node 185-2359",
  description: "추천 가게 한 곳을 야채 목록과 함께 보여 주는 카드예요.",
  Component: CardRecommendedStoreStory,
};
