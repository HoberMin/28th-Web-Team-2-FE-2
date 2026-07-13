import { notFound } from "next/navigation";
import { stories } from "./_stories/registry";

// 디자인 시스템 검증 갤러리 — 런칭 전까지 배포에서도 공개(팀 검증용 Vercel).
// 실사용자 릴리즈 시 Vercel env에 PLAYGROUND_DISABLED=1 설정으로 숨긴다 (conventions 참조)
// 배경은 디자이너 대조 기준인 흰색으로 고정 — 다크모드·전역 테마의 영향을 받지 않는다
export default function PlaygroundPage() {
  if (process.env.PLAYGROUND_DISABLED === "1") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto flex max-w-5xl flex-col md:flex-row">
        {/* 좌측 목차 — 모바일에선 상단 가로 스크롤 */}
        <nav
          aria-label="스토리 목차"
          className="shrink-0 border-b border-neutral-200 bg-white px-4 py-3 md:sticky md:top-0 md:h-screen md:w-52 md:border-r md:border-b-0 md:px-5 md:py-8"
        >
          <p className="text-sm font-bold">Playground</p>
          <p className="mt-1 hidden text-xs text-neutral-400 md:block">
            규격 1개 = 스토리 1개. Figma에 있는 것만.
          </p>
          <ul className="mt-3 flex gap-2 overflow-x-auto md:flex-col md:gap-1">
            {stories.map((s) => (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  className="block rounded px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          {stories.map((s) => (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-title`}
              className="mb-12 scroll-mt-4"
            >
              <div className="border-b border-neutral-200 pb-2">
                <h2 id={`${s.id}-title`} className="text-lg font-semibold">
                  {s.title}
                </h2>
                <p className="mt-0.5 text-xs text-neutral-400">
                  Figma: {s.figma}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{s.description}</p>
              </div>
              <div className="pt-5">
                <s.Component />
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
