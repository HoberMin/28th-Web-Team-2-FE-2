import { BadgeMapLocation } from "../../_components/badge-map-location";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `badge/map-location` — `화면GUI` F03 인스턴스 298-3611 (main component 298-3315), sync 2026-08-08.
// Figma 심볼은 하나뿐(variant·state 축 없음)이라 나열할 조합이 없다. 대신 이 규격에서
// 실제로 검산할 가치가 있는 세 가지를 보여 준다: 원본 크기 · hug 동작 · 지도 위 대비.
//
// 핀 아이콘은 Figma 원본 SVG(`public/figma/design-library/icons/map-pin-fill.svg`)를 쓴다 —
//    임시 도형은 걷어냈다. 배지가 아이콘 색(content/inverse)을 정하므로 currentColor로 넘긴다.
//
// 배경 규약(design-guide §1-1)상 스토리 배경은 흰색 고정이라, 지도 위에 얹힌 느낌은
// 회색 판을 깔아 대신 보여 준다. 배지 자체의 색은 바꾸지 않았다.

function MapPinFillIcon() {
  return <FigmaIcon name="map-pin-fill" width={16} currentColor />;
}

function BadgeMapLocationStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">Figma 원본</p>
        <div className="w-fit">
          <BadgeMapLocation label="광진구" icon={<MapPinFillIcon />} />
        </div>
        <p className="text-caption-12-regular text-content-secondary">
          Figma 실측 76×30 · pl 8 / pr 12 (좌우 비대칭이 의도예요)
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">글자 길이에 따라 늘어나요 (hug)</p>
        <div className="flex flex-wrap items-start gap-3">
          <BadgeMapLocation label="중구" icon={<MapPinFillIcon />} />
          <BadgeMapLocation label="광진구" icon={<MapPinFillIcon />} />
          <BadgeMapLocation label="서울 광진구 자양동" icon={<MapPinFillIcon />} />
        </div>
        <p className="text-caption-12-regular text-content-secondary">
          높이 30px은 14px × 1.55 + 위아래 4px의 결과예요. 고정값이 아니라서 글자가 커지면 같이
          커져요.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">지도 위에 놓인 모습</p>
        <div className="flex w-fit items-start gap-4 rounded-lg bg-surface-secondary p-6">
          <BadgeMapLocation label="광진구" icon={<MapPinFillIcon />} />
        </div>
        <p className="text-caption-12-regular text-content-secondary">
          글자 대비 5.5:1 — 본문 기준 4.5:1을 넘어요.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">아직 확인 못 한 것</p>
        <p className="text-caption-12-regular text-content-secondary">
          누를 수 있는지 모르겠어요. Figma에 hover·pressed·disabled 심볼이 없어서 지금은 표시
          전용(div)이에요. 지역을 바꾸는 진입점이면 버튼으로 바꿔야 해요.
        </p>
      </div>
    </div>
  );
}

export const badgeMapLocationStory: Story = {
  id: "badge-map-location",
  title: "Badge Map Location",
  group: "컴포넌트",
  figma: "node 298-3611 (화면GUI F03)",
  description: "지도 위에 지금 보고 있는 지역을 알려 주는 어두운 배지예요.",
  Component: BadgeMapLocationStory,
};
