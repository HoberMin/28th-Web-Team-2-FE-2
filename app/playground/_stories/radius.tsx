import type { Story } from "./types";

// Figma node 126-1092 (Radius 컬렉션) sync 2026-08-05 v02 — 2xl(20px)·3xl(24px) 신설.
// Tailwind 기본 rounded-* 를 우리 값으로 덮어쓴 상태 — 라벨의 px가 Figma 원본이다.
// `rounded`(무접미사)는 Figma에 없는 Tailwind 기본값이므로 쓰지 않는다.
// 2xl·3xl은 v02에서 Figma에 생겼다. 특히 2xl은 Tailwind 기본값 16px과 다른 20px이므로
// 반드시 이 토큰을 거쳐야 한다(3xl은 기본값과 우연히 같은 24px이지만 마찬가지로 토큰을 쓴다).
const RADII = [
  { cls: "rounded-sm", name: "radius/sm", px: "4px" },
  { cls: "rounded-md", name: "radius/md", px: "8px" },
  { cls: "rounded-lg", name: "radius/lg", px: "12px" },
  { cls: "rounded-xl", name: "radius/xl", px: "16px" },
  { cls: "rounded-2xl", name: "radius/2xl", px: "20px" },
  { cls: "rounded-3xl", name: "radius/3xl", px: "24px" },
  { cls: "rounded-full", name: "radius/full", px: "999px" },
];

function RadiusStory() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-caption-12-regular text-content-secondary">
        여기 있는 7가지 값만 써요. “rounded”(기본값 4px)처럼 지금은 값이 같아 보이는 것도 쓰지
        않아요 — 토큰을 거치지 않으면 나중에 Figma 값이 바뀌었을 때 반영되지 않거든요.
        “rounded-2xl”은 Tailwind 기본값이 16px이지만 우리 Figma 값은 20px이라 특히 조심해야 해요.
      </p>
      <div className="flex flex-wrap gap-5">
        {RADII.map(({ cls, name, px }) => (
          <div key={cls} className="flex flex-col items-center gap-2">
            <div className={`size-20 bg-gray-100 border border-border-primary ${cls}`} />
            <p className="text-body-14-medium text-content-primary">{name}</p>
            <p className="text-caption-12-regular tabular-nums text-content-secondary">
              {px} · {cls}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const radiusStory: Story = {
  id: "radius",
  title: "Radius",
  group: "파운데이션",
  figma: "node 126-1092",
  description: "모서리를 둥글게 만들 때 쓰는 7가지 값이에요.",
  Component: RadiusStory,
};
