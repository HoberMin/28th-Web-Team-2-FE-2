import type { Judgement } from "../_lib/judgement";
import { formatNumber } from "../_lib/format";

// 즉석 판단 결과 카드 — 결론 → 근거 → 다음 행동 순서로 읽히게 한다.
// 색만으로 뜻을 전하지 않는다: 문구가 결론을 그대로 말하고, 색은 보조다(WCAG 1.4.1).
const STYLE = {
  cheap: {
    surface: "bg-bg-positive-weak",
    accent: "text-fg-positive",
    mark: "🟢",
    srLabel: "좋은 가격",
  },
  fair: {
    surface: "bg-bg-neutral-weak",
    accent: "text-fg-neutral",
    mark: "🟡",
    srLabel: "적정 가격",
  },
  expensive: {
    surface: "bg-bg-warning-weak",
    accent: "text-fg-warning",
    mark: "🔴",
    srLabel: "비싼 가격",
  },
} as const;

export function VerdictCard({
  judgement,
  unit,
  pricePerUnit,
  reportCount,
  district,
}: {
  judgement: Judgement;
  unit: string;
  pricePerUnit: number;
  reportCount: number;
  district: string;
}) {
  const style = STYLE[judgement.verdict];

  return (
    <section
      aria-label="판단 결과"
      aria-live="polite"
      className={`flex flex-col gap-4 rounded-2xl px-5 py-5 ${style.surface}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl leading-none" aria-hidden="true">
          {style.mark}
        </span>
        <h2 className={`text-head2-20 ${style.accent}`}>
          <span className="sr-only">{style.srLabel}: </span>
          {judgement.headline}
        </h2>
      </div>

      <p className="text-body-14-regular text-fg-neutral">{judgement.advice}</p>

      {/* 근거 — 무엇과 비교했는지 밝힌다. 근거 없는 판정은 신뢰를 못 얻는다 */}
      <dl className="flex flex-col gap-1.5 border-t border-bg-neutral-weak-pressed pt-3 text-body-14-regular">
        <div className="flex items-center justify-between">
          <dt className="text-fg-neutral-subtle">입력한 가격</dt>
          <dd className="tabular-nums text-fg-neutral">
            {formatNumber(pricePerUnit)}원 / {unit}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-fg-neutral-subtle">{judgement.referenceLabel}</dt>
          <dd className="tabular-nums text-fg-neutral">
            {formatNumber(judgement.referencePrice)}원 / {unit}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-fg-neutral-subtle">비교 근거</dt>
          <dd className="text-fg-neutral-subtle">
            {reportCount > 0 ? `${district} 이웃 제보 ${reportCount}건` : "공공 시세(KAMIS)"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
