import type { Story } from "./types";

// Figma node 171-3737 sync 2026-08-05 — **최종본**.
// 패밀리는 Wanted Sans 1종(self-host). 구 head1/head2 2종 체계와 26·18-body 스케일은 폐기됐다.
// 각 줄에 Figma 스펙(크기 / line-height / 자간 / weight)을 붙여 sync 결과를 눈으로 대조할 수 있게 한다.
const SPECS = [
  {
    group: "title",
    note: "제목 — 24 / 20 / 18 × bold·semibold·medium",
    items: [
      { cls: "text-title-24-bold", spec: "24 · 1.45 · -2% · 700" },
      { cls: "text-title-24-semibold", spec: "24 · 1.45 · -2% · 600" },
      { cls: "text-title-24-medium", spec: "24 · 1.45 · -2% · 500" },
      { cls: "text-title-20-bold", spec: "20 · 1.5 · -2% · 700" },
      { cls: "text-title-20-semibold", spec: "20 · 1.45 · -2% · 600" },
      { cls: "text-title-20-medium", spec: "20 · 1.45 · -2% · 500" },
      { cls: "text-title-18-bold", spec: "18 · 1.45 · -2% · 700" },
      { cls: "text-title-18-semibold", spec: "18 · 1.55 · -2% · 600" },
      { cls: "text-title-18-medium", spec: "18 · 1.45 · -2% · 500" },
    ],
  },
  {
    group: "body",
    note: "본문 — 16 / 14 × bold·semibold·medium·regular",
    items: [
      { cls: "text-body-16-bold", spec: "16 · 1.55 · -2% · 700" },
      { cls: "text-body-16-semibold", spec: "16 · 1.55 · -2% · 600" },
      { cls: "text-body-16-medium", spec: "16 · 1.55 · -2% · 500" },
      { cls: "text-body-16-regular", spec: "16 · 1.55 · -2% · 400" },
      { cls: "text-body-14-bold", spec: "14 · 1.55 · -2% · 700" },
      { cls: "text-body-14-semibold", spec: "14 · 1.55 · -2% · 600" },
      { cls: "text-body-14-medium", spec: "14 · 1.55 · -2% · 500" },
      { cls: "text-body-14-regular", spec: "14 · 1.55 · -2% · 400" },
    ],
  },
  {
    group: "caption",
    note: "보조 — 12 × bold·semibold·medium·regular",
    items: [
      { cls: "text-caption-12-bold", spec: "12 · 1.45 · -2% · 700" },
      { cls: "text-caption-12-semibold", spec: "12 · 1.45 · -2% · 600" },
      { cls: "text-caption-12-medium", spec: "12 · 1.45 · -2% · 500" },
      { cls: "text-caption-12-regular", spec: "12 · 1.45 · -2% · 400" },
    ],
  },
];

function TypographyStory() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-caption-12-regular text-content-secondary">
        Wanted Sans · 스펙은 크기 · 줄 간격 · 자간 · 굵기 순이에요
      </p>
      {SPECS.map(({ group, note, items }) => (
        <section key={group} className="flex flex-col gap-3">
          <h3 className="text-caption-12-semibold text-content-secondary">{note}</h3>
          {items.map(({ cls, spec }) => (
            <div key={cls} className="flex flex-col gap-0.5 md:flex-row md:items-baseline md:gap-4">
              <p className={`${cls} text-content-primary md:w-96`}>
                오늘 애호박 시세 3,200원
              </p>
              <p className="text-caption-12-regular text-content-secondary">
                <span className="tabular-nums">{cls.replace("text-", "")}</span> · {spec}
              </p>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

export const typographyStory: Story = {
  id: "typography",
  title: "Typography",
  group: "파운데이션",
  figma: "node 171-3737",
  description: "제목·본문·보조 텍스트에 쓰는 타이포 스케일 21종을 모두 모았어요.",
  Component: TypographyStory,
};
