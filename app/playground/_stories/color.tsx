import type { Story } from "./types";

// Figma node 126-1092 (Raw Color · Semantic Color 컬렉션) sync 2026-08-05
// (디자인_docs/variables/variables_2026-08-05_v01.json 기준 재sync).
// 이 스토리의 목적은 "예쁘게 보여주기"가 아니라 **sync 검산**이다 —
// 라벨에 Figma 변수명과 기대 hex를 같이 적어두어, 디자이너가 @theme에 값을 주입한 뒤
// 화면과 라벨이 어긋나는지 눈으로 잡을 수 있게 한다(hex 오독이 두 번 발생한 이력이 있다).

const RAW: { group: string; items: { name: string; cls: string; hex: string }[] }[] = [
  {
    group: "common",
    items: [
      { name: "white", cls: "bg-white", hex: "#FFFFFF" },
      { name: "black5", cls: "bg-black-5", hex: "#000000 5%" },
      { name: "black50", cls: "bg-black-50", hex: "#000000 50%" },
      { name: "black", cls: "bg-black", hex: "#000000" },
    ],
  },
  {
    group: "gray",
    items: [
      { name: "gray/50", cls: "bg-gray-50", hex: "#F9F9FB" },
      { name: "gray/100", cls: "bg-gray-100", hex: "#F2F3F8" },
      { name: "gray/200", cls: "bg-gray-200", hex: "#E5E8EF" },
      { name: "gray/300", cls: "bg-gray-300", hex: "#CBD1DC" },
      { name: "gray/400", cls: "bg-gray-400", hex: "#B4BBCB" },
      { name: "gray/500", cls: "bg-gray-500", hex: "#99A1B1" },
      { name: "gray/600", cls: "bg-gray-600", hex: "#697383" },
      { name: "gray/700", cls: "bg-gray-700", hex: "#4A5667" },
      { name: "gray/800", cls: "bg-gray-800", hex: "#354153" },
      { name: "gray/900", cls: "bg-gray-900", hex: "#262F3C" },
      { name: "gray/1000", cls: "bg-gray-1000", hex: "#141A24" },
    ],
  },
  {
    group: "orange",
    items: [
      { name: "orange/50", cls: "bg-orange-50", hex: "#FFF8EC" },
      { name: "orange/100", cls: "bg-orange-100", hex: "#FFF0D3" },
      { name: "orange/200", cls: "bg-orange-200", hex: "#FFDEA5" },
      { name: "orange/300", cls: "bg-orange-300", hex: "#FFC56D" },
      { name: "orange/400", cls: "bg-orange-400", hex: "#FFA132" },
      { name: "orange/500", cls: "bg-orange-500", hex: "#FF850A" },
      { name: "orange/600", cls: "bg-orange-600", hex: "#FF6F00" },
      { name: "orange/700", cls: "bg-orange-700", hex: "#CC5002" },
      { name: "orange/800", cls: "bg-orange-800", hex: "#A13E0B" },
      { name: "orange/900", cls: "bg-orange-900", hex: "#82350C" },
      { name: "orange/1000", cls: "bg-orange-1000", hex: "#461804" },
    ],
  },
  {
    group: "red",
    items: [
      { name: "red/50", cls: "bg-red-50", hex: "#FFF1F3" },
      { name: "red/100", cls: "bg-red-100", hex: "#FFE0E4" },
      { name: "red/200", cls: "bg-red-200", hex: "#FFC6CC" },
      { name: "red/300", cls: "bg-red-300", hex: "#FF9EA9" },
      { name: "red/400", cls: "bg-red-400", hex: "#FF6677" },
      { name: "red/500", cls: "bg-red-500", hex: "#FD364D" },
      { name: "red/600", cls: "bg-red-600", hex: "#ED2C42" },
      { name: "red/700", cls: "bg-red-700", hex: "#C60F24" },
      { name: "red/800", cls: "bg-red-800", hex: "#A41021" },
      { name: "red/900", cls: "bg-red-900", hex: "#871522" },
      { name: "red/1000", cls: "bg-red-1000", hex: "#4A050D" },
    ],
  },
  {
    group: "green",
    items: [
      { name: "green/50", cls: "bg-green-50", hex: "#ECFDF4" },
      { name: "green/100", cls: "bg-green-100", hex: "#D1FAE1" },
      { name: "green/200", cls: "bg-green-200", hex: "#A7F3C9" },
      { name: "green/300", cls: "bg-green-300", hex: "#6EE7AC" },
      { name: "green/400", cls: "bg-green-400", hex: "#34D38B" },
      { name: "green/500", cls: "bg-green-500", hex: "#10B972" },
      { name: "green/600", cls: "bg-green-600", hex: "#05A163" },
      { name: "green/700", cls: "bg-green-700", hex: "#04784D" },
      { name: "green/800", cls: "bg-green-800", hex: "#065F3E" },
      { name: "green/900", cls: "bg-green-900", hex: "#064E35" },
      { name: "green/1000", cls: "bg-green-1000", hex: "#022C1E" },
    ],
  },
  {
    group: "blue",
    items: [
      { name: "blue/50", cls: "bg-blue-50", hex: "#EEF7FF" },
      { name: "blue/100", cls: "bg-blue-100", hex: "#D9EDFF" },
      { name: "blue/200", cls: "bg-blue-200", hex: "#BBE1FF" },
      { name: "blue/300", cls: "bg-blue-300", hex: "#8CCFFF" },
      { name: "blue/400", cls: "bg-blue-400", hex: "#55B4FF" },
      { name: "blue/500", cls: "bg-blue-500", hex: "#2E94FF" },
      { name: "blue/600", cls: "bg-blue-600", hex: "#217CF9" },
      { name: "blue/700", cls: "bg-blue-700", hex: "#105FE5" },
      { name: "blue/800", cls: "bg-blue-800", hex: "#144DB9" },
      { name: "blue/900", cls: "bg-blue-900", hex: "#174491" },
      { name: "blue/1000", cls: "bg-blue-1000", hex: "#132A58" },
    ],
  },
];

// 시맨틱 — Figma alias 그대로. raw를 직접 쓰지 말고 여기서 고르는 게 원칙이다.
const SEMANTIC: { name: string; cls: string; alias: string }[] = [
  { name: "background/primary", cls: "bg-background-primary", alias: "common/white" },
  { name: "background/secondary", cls: "bg-background-secondary", alias: "gray/50" },
  { name: "surface/primary", cls: "bg-surface-primary", alias: "common/white" },
  { name: "surface/secondary", cls: "bg-surface-secondary", alias: "gray/100" },
  { name: "surface/elevated", cls: "bg-surface-elevated", alias: "gray/700 90% (구 surface/tertiary)" },
  { name: "content/primary", cls: "bg-content-primary", alias: "gray/900" },
  { name: "content/secondary", cls: "bg-content-secondary", alias: "gray/600" },
  { name: "content/disabled", cls: "bg-content-disabled", alias: "gray/400" },
  { name: "content/inverse", cls: "bg-content-inverse", alias: "gray/50" },
  { name: "content/brand-light", cls: "bg-content-brand-light", alias: "green/600" },
  { name: "content/brand-medium", cls: "bg-content-brand-medium", alias: "green/700" },
  { name: "content/brand-dark", cls: "bg-content-brand-dark", alias: "green/900" },
  { name: "border/primary", cls: "bg-border-primary", alias: "gray/200" },
  { name: "border/secondary", cls: "bg-border-secondary", alias: "gray/100" },
  { name: "border/tertiary", cls: "bg-border-tertiary", alias: "gray/700" },
  { name: "action-primary/default", cls: "bg-action-primary-default", alias: "green/500" },
  { name: "action-primary/pressed", cls: "bg-action-primary-pressed", alias: "green/600" },
  { name: "action-primary/disabled", cls: "bg-action-primary-disabled", alias: "gray/300" },
  { name: "action-secondary/default", cls: "bg-action-secondary-default", alias: "gray/900" },
  { name: "action-secondary/pressed", cls: "bg-action-secondary-pressed", alias: "gray/700" },
  { name: "action-secondary/disabled", cls: "bg-action-secondary-disabled", alias: "gray/300" },
  { name: "action-tertiary/default", cls: "bg-action-tertiary-default", alias: "gray/100" },
  { name: "action-tertiary/pressed", cls: "bg-action-tertiary-pressed", alias: "gray/200" },
  { name: "action-tertiary/disabled", cls: "bg-action-tertiary-disabled", alias: "gray/300" },
  { name: "trend/up", cls: "bg-trend-up", alias: "red/600" },
  { name: "trend/down", cls: "bg-trend-down", alias: "blue/600" },
  { name: "trend/flat", cls: "bg-trend-flat", alias: "gray/400" },
  { name: "overlay/dim", cls: "bg-overlay-dim", alias: "common/black50" },
];

function Swatch({ cls, label, sub }: { cls: string; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      {/* 체커보드 배경 — alpha 토큰(black50·overlay/dim·surface/elevated)의 투명도가 보이게 */}
      <div
        className="size-10 shrink-0 rounded-md border border-border-primary"
        style={{
          backgroundImage:
            "linear-gradient(45deg,#e5e8ef 25%,transparent 25%,transparent 75%,#e5e8ef 75%),linear-gradient(45deg,#e5e8ef 25%,transparent 25%,transparent 75%,#e5e8ef 75%)",
          backgroundSize: "12px 12px",
          backgroundPosition: "0 0,6px 6px",
        }}
      >
        <div className={`size-full rounded-md ${cls}`} />
      </div>
      <div className="min-w-0">
        <p className="text-body-14-medium text-content-primary">{label}</p>
        <p className="text-caption-12-regular tabular-nums text-content-secondary">{sub}</p>
      </div>
    </div>
  );
}

function ColorStory() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-caption-12-regular text-content-secondary">
        라벨의 값은 Figma 원본이다 — 스와치와 라벨이 어긋나면 `@theme` sync가 틀린 것이다.
      </p>

      <section className="flex flex-col gap-4">
        <h3 className="text-caption-12-semibold text-content-secondary">
          Semantic Color — 화면에서는 이걸 고른다 (28)
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {SEMANTIC.map(({ name, cls, alias }) => (
            <Swatch key={name} cls={cls} label={name} sub={`→ ${alias}`} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h3 className="text-caption-12-semibold text-content-secondary">
          Raw Color — 팔레트 원재료 (59). 시맨틱 슬롯이 있으면 직접 쓰지 않는다
        </h3>
        {RAW.map(({ group, items }) => (
          <div key={group} className="flex flex-col gap-3">
            <p className="text-caption-12-medium text-content-secondary">{group}</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {items.map(({ name, cls, hex }) => (
                <Swatch key={name} cls={cls} label={name} sub={hex} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export const colorStory: Story = {
  id: "color",
  title: "Color",
  group: "파운데이션",
  figma: "node 126-1092",
  description:
    "Raw Color 59 + Semantic Color 28. 라벨에 Figma 원본 hex·alias를 함께 적어 sync 검산용으로 쓴다.",
  Component: ColorStory,
};
