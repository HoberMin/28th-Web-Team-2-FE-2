import Link from "next/link";
import type { CoursePlan } from "../_lib/course";
import { formatNumber, formatWon } from "../_lib/format";

// 장보기 코스 — "한 곳에서 다 살까, 한 곳 더 돌까"를 금액과 발걸음으로 같이 보여준다.
// 절약액만 보여주고 가게를 흩어놓으면 노력 절약과 반대가 되므로, 선택은 사용자에게 맡긴다.
// 인터랙션 없어 서버 렌더 가능(부모가 클라라 클라에서 실행되지만 상태를 갖지 않는다).
export function CourseCard({ plan, district }: { plan: CoursePlan; district: string }) {
  if (!plan.single) {
    return (
      <section
        aria-label="장보기 코스"
        className="flex flex-col gap-2 rounded-2xl bg-bg-neutral-weak px-5 py-4"
      >
        <h2 className="text-body-16-semibold text-fg-neutral">어디서 살지 정하기</h2>
        <p className="text-body-14-regular text-fg-neutral-muted">
          {district}에 가게별 제보가 아직 없어 코스를 짤 수 없어요. 제보할 때 가게를 골라주시면
          &ldquo;한 곳에서 다 사기 vs 두 곳 돌기&rdquo;를 금액으로 비교해 드려요.
        </p>
      </section>
    );
  }

  const { single, pair, extraSaving, baselineTotal } = plan;
  const singleSaving = baselineTotal - single.total;

  return (
    <section aria-label="장보기 코스" className="flex flex-col gap-3">
      <h2 className="text-head2-16 text-fg-neutral">어디서 살까요?</h2>

      {/* 1안 — 한 곳에서 전부. 기본 추천(발걸음 최소) */}
      <div className="flex flex-col gap-2 rounded-2xl bg-bg-brand-weak px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-body-14-medium text-fg-neutral">한 곳에서 다 사기</span>
          <span className="rounded-md bg-bg-layer-default px-2 py-0.5 text-caption-12-regular text-fg-neutral">
            추천
          </span>
        </div>
        <Link
          href={`/prototype/store/${encodeURIComponent(single.stores[0])}`}
          className="text-body-16-semibold text-fg-neutral underline decoration-transparent active:decoration-current"
        >
          {single.stores[0]}
        </Link>
        <div className="flex items-baseline justify-between">
          <span className="text-caption-12-regular text-fg-neutral-muted">
            {single.coveredCount}개 제보가
            {single.fallbackCount > 0 && ` · ${single.fallbackCount}개는 시세로 계산`}
          </span>
          <span className="text-head2-18 tabular-nums text-fg-neutral">{formatWon(single.total)}</span>
        </div>
        {singleSaving > 0 && (
          <p className="text-caption-12-regular tabular-nums text-fg-positive">
            공공 시세로 사는 것보다 {formatNumber(singleSaving)}원 절약 예상
          </p>
        )}
      </div>

      {/* 2안 — 두 곳. 더 싸질 때만 나타난다 */}
      {pair && (
        <div className="flex flex-col gap-2 rounded-2xl bg-bg-neutral-weak px-5 py-4">
          <span className="text-body-14-medium text-fg-neutral-muted">두 곳 돌기</span>
          <p className="flex flex-wrap items-center gap-1 text-body-16-semibold text-fg-neutral">
            {pair.stores.map((name, i) => (
              <span key={name} className="flex items-center gap-1">
                {i > 0 && <span className="text-fg-neutral-muted">→</span>}
                <Link href={`/prototype/store/${encodeURIComponent(name)}`} className="underline">
                  {name}
                </Link>
              </span>
            ))}
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-caption-12-regular text-fg-neutral-muted">
              {pair.coveredCount}개 제보가
              {pair.fallbackCount > 0 && ` · ${pair.fallbackCount}개는 시세로 계산`}
            </span>
            <span className="text-head2-18 tabular-nums text-fg-neutral">{formatWon(pair.total)}</span>
          </div>
          {/* 트레이드오프를 그대로 말한다 — 아끼는 금액과 늘어나는 발걸음을 한 문장에 */}
          <p className="text-caption-12-regular tabular-nums text-fg-neutral">
            한 곳보다 <strong className="font-semibold text-fg-positive">{formatNumber(extraSaving)}원</strong>{" "}
            더 아끼지만 가게를 한 곳 더 들러야 해요.
          </p>
        </div>
      )}
    </section>
  );
}
