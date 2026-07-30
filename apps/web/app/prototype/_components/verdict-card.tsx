import IconCheckmarkCircleFill from "@karrotmarket/react-monochrome-icon/IconCheckmarkCircleFill";
import IconExclamationmarkCircleFill from "@karrotmarket/react-monochrome-icon/IconExclamationmarkCircleFill";
import IconExclamationmarkTriangleFill from "@karrotmarket/react-monochrome-icon/IconExclamationmarkTriangleFill";
import type { Judgement } from "../_lib/judgement";
import { formatNumber } from "../_lib/format";

// 즉석 판단 결과 카드 — 결론 → 근거 → 다음 행동 순서로 읽히게 한다.
// 색만으로 뜻을 전하지 않는다: 문구가 결론을 그대로 말하고, 색은 보조다(WCAG 1.4.1).
//
// 표식은 이모지(🟢🟡🔴)가 아니라 아이콘 컴포넌트다. 이모지는 OS·폰트마다 다르게 렌더되고,
// 무엇보다 "🔴 빨강"과 warning(노란 갈색) 토큰이 어긋나 색과 기호가 다른 말을 하고 있었다.
// 비싸다 = critical(빨강)로 일치시킨다.
const STYLE = {
  cheap: {
    surface: "bg-bg-positive-weak",
    accent: "text-fg-positive",
    Mark: IconCheckmarkCircleFill,
    srLabel: "좋은 가격",
  },
  fair: {
    surface: "bg-bg-neutral-weak",
    accent: "text-fg-neutral",
    Mark: IconExclamationmarkCircleFill,
    srLabel: "적정 가격",
  },
  expensive: {
    surface: "bg-bg-critical-weak",
    accent: "text-fg-critical",
    Mark: IconExclamationmarkTriangleFill,
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
  const { Mark } = style;

  return (
    <section
      aria-label="판단 결과"
      aria-live="polite"
      className={`flex flex-col gap-4 rounded-2xl px-5 py-5 ${style.surface}`}
    >
      <div className="flex items-center gap-2">
        <span className={`shrink-0 ${style.accent} [&_svg]:size-6`} aria-hidden="true">
          <Mark />
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
          <dt className="text-fg-neutral-muted">입력한 가격</dt>
          <dd className="tabular-nums text-fg-neutral">
            {formatNumber(pricePerUnit)}원 / {unit}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-fg-neutral-muted">{judgement.referenceLabel}</dt>
          <dd className="tabular-nums text-fg-neutral">
            {formatNumber(judgement.referencePrice)}원 / {unit}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-fg-neutral-muted">비교 근거</dt>
          <dd className="text-fg-neutral-muted">
            {reportCount > 0 ? `${district} 이웃 제보 ${reportCount}건` : "공공 시세(KAMIS)"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
