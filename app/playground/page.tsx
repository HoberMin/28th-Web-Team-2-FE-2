import { notFound } from "next/navigation";
import { stories } from "./_stories/registry";
import type { StoryGroup } from "./_stories/types";

// 디자인 시스템 검증 갤러리 — 런칭 전까지 배포에서도 공개(팀 검증용 Vercel).
// 실사용자 릴리즈 시 Vercel env에 PLAYGROUND_DISABLED=1 설정으로 숨긴다 (conventions 참조)
// 배경은 디자이너 대조 기준인 흰색으로 고정 — 다크모드·전역 테마의 영향을 받지 않는다.
//
// 2026-08-05: 갤러리 크롬 자체를 우리 디자인 시스템으로 다시 지었다. 이전에는 Tailwind 기본
// 팔레트(neutral-*)와 임의 크기(text-[11px]·text-sm)를 써서, **검증 도구가 검증 대상 규격을
// 안 지키는** 상태였다. 지금은 크롬도 전부 시맨틱 컬러 + Figma 타이포 토큰 + radius 토큰만 쓴다.
// 덕분에 이 페이지 자체가 토큰의 첫 소비자이자 회귀 감지면이 된다.

const GROUP_ORDER: StoryGroup[] = ["파운데이션", "컴포넌트", "패턴"];

export default function PlaygroundPage() {
  if (process.env.PLAYGROUND_DISABLED === "1") {
    notFound();
  }

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: stories.filter((s) => s.group === group),
  })).filter((g) => g.items.length > 0);

  const total = grouped.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary">
      <div className="mx-auto flex max-w-5xl flex-col md:flex-row">
        {/* 좌측 목차 — 모바일에선 상단 가로 스크롤 */}
        <nav
          aria-label="스토리 목차"
          className="shrink-0 border-b border-border-primary bg-surface-primary px-4 py-3 md:sticky md:top-0 md:h-screen md:w-56 md:overflow-y-auto md:border-r md:border-b-0 md:px-5 md:py-8"
        >
          <p className="text-body-16-bold">디자인 시스템</p>
          <p className="mt-1 text-caption-12-regular text-content-secondary">
            규격 {total}개 · Figma가 진실 소스
          </p>
          <p className="mt-2 hidden text-caption-12-regular text-content-secondary md:block">
            규격 1개 = 스토리 1개.
            <br />
            Figma에 있는 것만 등록.
          </p>
          <div className="mt-4 flex gap-4 overflow-x-auto no-scrollbar md:flex-col md:gap-5">
            {grouped.map(({ group, items }) => (
              <div key={group} className="shrink-0">
                <p className="px-2 text-caption-12-semibold text-content-secondary">{group}</p>
                <ul className="mt-1 flex gap-1 md:flex-col">
                  {items.map((s) => (
                    <li key={s.id} className="shrink-0">
                      <a
                        href={`#${s.id}`}
                        className="block rounded-md px-2 py-1.5 text-body-14-medium text-content-secondary hover:bg-action-tertiary-default hover:text-content-primary active:bg-action-tertiary-pressed"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          {grouped.map(({ group, items }) => (
            <section key={group} aria-label={group} className="mb-14">
              <h2 className="text-caption-12-semibold text-content-secondary">{group}</h2>
              {items.map((s) => (
                <section
                  key={s.id}
                  id={s.id}
                  aria-labelledby={`${s.id}-title`}
                  className="mt-4 mb-10 scroll-mt-4 rounded-xl border border-border-primary"
                >
                  <div className="border-b border-border-secondary px-5 py-4">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 id={`${s.id}-title`} className="text-title-18-semibold">
                        {s.title}
                      </h3>
                      {s.figma.startsWith("https://") ? (
                        <a
                          href={s.figma}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${s.title} Figma 원본`}
                          className="rounded-sm bg-action-tertiary-default px-1.5 py-0.5 text-caption-12-regular text-content-secondary hover:text-content-primary"
                        >
                          Figma 원본
                        </a>
                      ) : (
                        <span className="rounded-sm bg-action-tertiary-default px-1.5 py-0.5 text-caption-12-regular text-content-secondary">
                          Figma {s.figma}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-body-14-regular text-content-secondary">
                      {s.description}
                    </p>
                  </div>
                  <div className="px-5 py-6">
                    <s.Component />
                  </div>
                </section>
              ))}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
