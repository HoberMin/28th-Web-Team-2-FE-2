import { CardRecommendedStore } from "../../_components/card-recommended-store";
import { ImageGrass } from "../../_components/image-grass";
import type { Story } from "./types";

// Figma `card/recommended-store` node 185-2359, sync 2026-08-08. Variant 없음.
//
// ⛔ **카드 배경색이 아직 미해결이다.** Figma 원본은 연한 초록 그라데이션인데 그 색들이 Figma
// Variable로 등록돼 있지 않아, 우리 토큰으로 옮길 방법이 없다(자세한 근거는 컴포넌트 파일 주석).
// 그래서 컴포넌트는 배경을 정하지 않고, 아래 예시에서는 임시로 연한 초록 한 가지를 깔았다.
// **이 초록은 Figma 원본 색이 아니다** — 디자이너 확인이 필요하다.
//
// ⚠️ 가게 아이콘·화살표·야채 그림·풀 그림은 Figma 에셋을 코드로 가져올 수 없어 자리표시로 대신했다.

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

function VisualPlaceholder() {
  return (
    <span className="flex size-12 items-center justify-center rounded-full bg-surface-primary text-caption-12-regular text-content-disabled">
      그림
    </span>
  );
}

function GrassPlaceholder({ label }: { label: string }) {
  return (
    <span className="flex size-full items-center justify-center rounded-sm bg-surface-primary text-caption-12-regular text-content-brand-medium">
      {label}
    </span>
  );
}

const VEGETABLES = ["양파", "대추방울토마토", "얼갈이배추", "새송이버섯", "고춧가루(중국산)"].map(
  (name) => ({ name, visual: <VisualPlaceholder /> }),
);

function CardRecommendedStoreStory() {
  return (
    <div className="flex max-w-90 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">기본</p>
        <CardRecommendedStore
          className="bg-surface-brand"
          storeIcon={<StoreIcon />}
          name="농협하나로마트"
          distance="460m"
          summaryLabel="공공 시세보다 저렴한 야채"
          summaryValue="12가지"
          trailingIcon={<ChevronRightIcon />}
          vegetables={VEGETABLES}
          moreCount={7}
          grass={
            <ImageGrass
              left={<GrassPlaceholder label="왼쪽 풀" />}
              right={<GrassPlaceholder label="오른쪽 풀" />}
            />
          }
        />
        <p className="text-caption-12-regular text-content-secondary">
          배경 초록은 임시예요. 원래 디자인은 위아래로 색이 변하는 그라데이션인데, 아직 그 색이
          디자인 토큰으로 등록되지 않아 그대로 옮기지 못했어요.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">배경을 지정하지 않으면</p>
        <CardRecommendedStore
          storeIcon={<StoreIcon />}
          name="행복슈퍼마켓"
          distance="820m"
          summaryLabel="공공 시세보다 저렴한 야채"
          summaryValue="5가지"
          trailingIcon={<ChevronRightIcon />}
          vegetables={VEGETABLES.slice(0, 3)}
        />
        <p className="text-caption-12-regular text-content-secondary">
          배경 없이 그려져요. 색이 확정되기 전이라는 걸 눈으로 알 수 있게 일부러 이렇게 뒀어요.
        </p>
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
