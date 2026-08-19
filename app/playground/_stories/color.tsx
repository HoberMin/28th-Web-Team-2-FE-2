import type { Story } from "./types";

// Figma node 126-1092 (Raw Color · Semantic Color 컬렉션) sync 2026-08-13 v03
// (디자인_docs/variables/variables_2026-08-13-v03.json 기준 재sync — 값 변경 0, 이름·신설만).
// 눈으로 색을 훑어보는 갤러리이면서, 동시에 sync 검산 도구이기도 하다(hex 오독이 두 번 발생한
// 이력이 있어 만든 안전판) — 라벨에 Figma 변수명과 기대 hex를 같이 적어 화면과 라벨이 어긋나는지
// 잡을 수 있게 한다. 화면 문구는 뷰어 관점(무엇을 언제 쓰는지)으로 쓰되, 검산 안내 한 줄은 유지한다
// (design-guide.md §0).

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
// usage는 화면에서 어디에 쓰는지 보여주는 안내 문구 — 토큰명에서 유추한 초안이라
// 디자이너 확인 후 다듬을 수 있다.
const SEMANTIC: {
  group: string;
  items: { name: string; cls: string; alias: string; usage: string }[];
}[] = [
  {
    group: "background",
    items: [
      { name: "background/primary", cls: "bg-background-primary", alias: "common/white", usage: "페이지 기본 배경" },
      { name: "background/secondary", cls: "bg-background-secondary", alias: "gray/50", usage: "배경 위 보조 영역" },
    ],
  },
  {
    group: "surface",
    items: [
      { name: "surface/primary", cls: "bg-surface-primary", alias: "common/white", usage: "카드·시트 등 콘텐츠 표면" },
      { name: "surface/secondary", cls: "bg-surface-secondary", alias: "gray/100", usage: "표면 위 두 번째 레이어" },
      {
        name: "surface/elevated",
        cls: "bg-surface-elevated",
        alias: "gray/700 90%",
        usage: "떠 있는 어두운 요소(툴팁·플로팅 버튼) · 글자는 content/inverse",
      },
      {
        name: "surface/inverse",
        cls: "bg-surface-inverse",
        alias: "gray/1000 90%",
        usage: "가장 어두운 반전 표면(스낵바·하단 안내) · 글자는 content/inverse",
      },
      {
        name: "surface/accent/orange-subtle",
        cls: "bg-surface-accent-orange-subtle",
        alias: "orange/50",
        usage: "강조 영역의 옅은 배경(안내 박스·선택된 칩)",
      },
      {
        name: "surface/accent/orange",
        cls: "bg-surface-accent-orange",
        alias: "orange/100",
        usage: "강조 영역의 배경 · subtle보다 한 단계 진하게",
      },
      {
        name: "surface/brand",
        cls: "bg-surface-brand",
        alias: "green/50",
        usage: "브랜드 색 영역의 옅은 배경",
      },
    ],
  },
  {
    group: "content",
    items: [
      { name: "content/primary", cls: "bg-content-primary", alias: "gray/900", usage: "기본 텍스트" },
      { name: "content/secondary", cls: "bg-content-secondary", alias: "gray/600", usage: "보조 텍스트" },
      { name: "content/disabled", cls: "bg-content-disabled", alias: "gray/400", usage: "비활성 텍스트" },
      {
        name: "content/selected",
        cls: "bg-content-selected",
        alias: "gray/800",
        usage: "선택된 상태의 텍스트·아이콘 · 흰 배경 대비 10.33:1 ✅ (JDS_v2 신설)",
      },
      { name: "content/inverse", cls: "bg-content-inverse", alias: "gray/50", usage: "어두운 배경 위 텍스트" },
      { name: "content/brand-light", cls: "bg-content-brand-light", alias: "green/600", usage: "브랜드 텍스트 · 밝게" },
      { name: "content/brand-medium", cls: "bg-content-brand-medium", alias: "green/700", usage: "브랜드 텍스트 · 중간" },
      { name: "content/brand-dark", cls: "bg-content-brand-dark", alias: "green/900", usage: "브랜드 텍스트 · 진하게" },
      {
        name: "content/accent/badge",
        cls: "bg-content-accent-badge",
        alias: "orange/700",
        usage: "배지의 강조 텍스트·숫자 · 흰 배경에서 대비 4.45:1로 기준(4.5:1)에 살짝 못 미쳐요",
      },
      {
        name: "content/accent/favorite",
        cls: "bg-content-accent-favorite",
        alias: "red/500",
        usage: "찜(하트) 활성 색 · 흰 배경 대비 3.61:1 — 아이콘(비텍스트) 기준 3:1 충족",
      },
      {
        name: "content/error",
        cls: "bg-content-error",
        alias: "red/500",
        usage: "에러 문구·입력 오류 테두리 · 흰 배경 대비 3.61:1로 본문 기준(4.5:1) 미달",
      },
      {
        name: "content/rank/king",
        cls: "bg-content-rank-king",
        alias: "orange/400",
        usage: "제보왕 등급 · 흰 배경 대비 2.02:1 (본문 기준 4.5:1 미달)",
      },
      {
        name: "content/rank/expert",
        cls: "bg-content-rank-expert",
        alias: "green/500",
        usage: "제보 고수 등급 · 흰 배경 대비 2.56:1 (본문 기준 4.5:1 미달)",
      },
      {
        name: "content/rank/rookie",
        cls: "bg-content-rank-rookie",
        alias: "gray/600",
        usage: "제보 초보 등급 · 흰 배경 대비 4.79:1 ✅",
      },
      {
        name: "content/rank/sprout",
        cls: "bg-content-rank-sprout",
        alias: "gray/400",
        usage: "새싹 등급 · 흰 배경 대비 1.92:1 (본문 기준 4.5:1 미달)",
      },
    ],
  },
  {
    group: "border",
    items: [
      { name: "border/primary", cls: "bg-border-primary", alias: "gray/200", usage: "기본 구분선" },
      { name: "border/secondary", cls: "bg-border-secondary", alias: "gray/100", usage: "옅은 구분선" },
      { name: "border/tertiary", cls: "bg-border-tertiary", alias: "gray/700", usage: "진한 구분선" },
      {
        name: "border/img",
        cls: "bg-border-img",
        alias: "common/black5",
        usage: "사진 가장자리에 얹는 아주 옅은 선 · 밝은 사진과 흰 배경의 경계용(장식)",
      },
    ],
  },
  {
    group: "action-primary",
    items: [
      { name: "action-primary/default", cls: "bg-action-primary-default", alias: "green/500", usage: "주요 버튼" },
      {
        name: "action-primary/pressed",
        cls: "bg-action-primary-pressed",
        alias: "green/600",
        usage: "주요 버튼 · 눌렸을 때",
      },
      {
        name: "action-primary/disabled",
        cls: "bg-action-primary-disabled",
        alias: "gray/300",
        usage: "주요 버튼 · 비활성",
      },
    ],
  },
  {
    group: "action-secondary",
    items: [
      { name: "action-secondary/default", cls: "bg-action-secondary-default", alias: "gray/900", usage: "보조 버튼" },
      {
        name: "action-secondary/pressed",
        cls: "bg-action-secondary-pressed",
        alias: "gray/700",
        usage: "보조 버튼 · 눌렸을 때",
      },
      {
        name: "action-secondary/disabled",
        cls: "bg-action-secondary-disabled",
        alias: "gray/300",
        usage: "보조 버튼 · 비활성",
      },
    ],
  },
  {
    group: "action-tertiary",
    items: [
      {
        name: "action-tertiary/default",
        cls: "bg-action-tertiary-default",
        alias: "gray/100",
        usage: "약한 강조 버튼",
      },
      {
        name: "action-tertiary/pressed",
        cls: "bg-action-tertiary-pressed",
        alias: "gray/200",
        usage: "약한 강조 버튼 · 눌렸을 때",
      },
      {
        name: "action-tertiary/disabled",
        cls: "bg-action-tertiary-disabled",
        alias: "gray/300",
        usage: "약한 강조 버튼 · 비활성",
      },
    ],
  },
  {
    group: "trend",
    items: [
      { name: "trend/up", cls: "bg-trend-up", alias: "red/600", usage: "시세 상승" },
      { name: "trend/down", cls: "bg-trend-down", alias: "blue/600", usage: "시세 하락" },
      {
        name: "trend/flat",
        cls: "bg-trend-flat",
        alias: "gray/400",
        usage: "시세 보합 · 배경·아이콘용(작은 글자는 대비 부족해 content/secondary 사용)",
      },
    ],
  },
  {
    group: "overlay",
    items: [
      {
        name: "overlay/dim",
        cls: "bg-overlay-dim",
        alias: "common/black50",
        usage: "모달·시트 뒤 어둡게 깔리는 배경",
      },
    ],
  },
];

function Swatch({
  cls,
  label,
  sub,
  usage,
}: {
  cls: string;
  label: string;
  sub: string;
  usage?: string;
}) {
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
        {usage && <p className="text-caption-12-medium text-content-secondary">{usage}</p>}
        <p className="text-caption-12-regular tabular-nums text-content-disabled">{sub}</p>
      </div>
    </div>
  );
}

function ColorStory() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-caption-12-regular text-content-secondary">
        색상 이름 옆에 실제 값과 어디에 쓰는지를 함께 적어뒀어요. 스와치와 옆에 적힌 값이 다르면
        토큰 sync가 잘못된 거예요. (쓰임 설명은 초안이라 디자이너 확인 후 다듬을 수 있어요.)
      </p>

      <section className="flex flex-col gap-6">
        <h3 className="text-caption-12-semibold text-content-secondary">
          Semantic Color — 실제 화면에서 쓰는 색이에요 (34)
        </h3>
        {SEMANTIC.map(({ group, items }) => (
          <div key={group} className="flex flex-col gap-3">
            <p className="text-caption-12-medium text-content-secondary">{group}</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {items.map(({ name, cls, alias, usage }) => (
                <Swatch key={name} cls={cls} label={name} sub={`→ ${alias}`} usage={usage} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-5">
        <h3 className="text-caption-12-semibold text-content-secondary">
          Raw Color — 팔레트의 원재료예요 (59). 시맨틱 컬러로 표현할 수 있으면 원색은 직접 쓰지
          않아요.
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
  description: "Raw Color 59종과 Semantic Color 34종을 모아뒀어요. 실제 값과 쓰임을 함께 보여드려요.",
  Component: ColorStory,
};
