import IconCheckmarkCircleFill from "@karrotmarket/react-monochrome-icon/IconCheckmarkCircleFill";
import IconExclamationmarkCircleFill from "@karrotmarket/react-monochrome-icon/IconExclamationmarkCircleFill";
import IconExclamationmarkTriangleFill from "@karrotmarket/react-monochrome-icon/IconExclamationmarkTriangleFill";
import type { Judgement } from "../_lib/judgement";
import { formatDiff, formatNumber, getDiffColorToken } from "../_lib/format";

// 즉석 판단 결과 카드 — 결론 → 근거 → 다음 행동 순서로 읽히게 한다.
// 색만으로 뜻을 전하지 않는다: 문구가 결론을 그대로 말하고, 색은 보조다(WCAG 1.4.1).
//
// 표식은 이모지(🟢🟡🔴)가 아니라 아이콘 컴포넌트다. 이모지는 OS·폰트마다 다르게 렌더되고,
// 무엇보다 "🔴 빨강"과 warning(노란 갈색) 토큰이 어긋나 색과 기호가 다른 말을 하고 있었다.
// 비싸다 = critical(빨강)로 일치시킨다.
const RESULT_STYLE = {
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

/**
 * 판단 카드 상태 — 판정 전에도 카드가 **항상 마운트**돼 있어야 한다(백로그 F10 #1·#9).
 * 조건부 마운트였을 때 문제가 둘이었다: 판정 카드가 화면 아래쪽 스크롤 영역에 있어 키보드가
 * 뜨면 밀려났고, aria-live 리전이 판정과 함께 생겼다 사라져 첫 판정이 스크린리더에 안 읽혔다.
 * 이제 이 컴포넌트는 화면에 항상 그려지고, kind만 바뀐다.
 */
export type JudgeStatus =
  | { kind: "empty" }
  | { kind: "needUnit" }
  | { kind: "needPrice" }
  | { kind: "noBaseline"; vegetableName: string; seasonLabel?: string }
  | {
      kind: "result";
      judgement: Judgement;
      unit: string;
      pricePerUnit: number;
      reportCount: number;
      district: string;
    };

const PLACEHOLDER_COPY: Record<"empty" | "needUnit" | "needPrice", string> = {
  empty: "야채와 가격을 입력하면 3초 안에 판정해드려요",
  needUnit: "파는 단위를 먼저 골라주세요",
  needPrice: "가격을 입력하면 판정을 보여드려요",
};

/** "양파" → "양파는" / "감자" → "감자는" — 받침 유무로 조사를 고른다(조사 하드코딩 문제 해결). */
function withTopicJosa(word: string): string {
  const lastChar = word.charCodeAt(word.length - 1) - 0xac00;
  const hasBatchim = lastChar >= 0 && lastChar <= 11171 && lastChar % 28 !== 0;
  return `${word}${hasBatchim ? "은" : "는"}`;
}

/** 상시 라이브 리전에 넣을 한 줄 — 상태가 바뀔 때마다 이 문자열만 갈아끼운다. */
export function verdictAnnouncement(status: JudgeStatus): string {
  switch (status.kind) {
    case "result":
      return status.judgement.headline;
    case "noBaseline":
      return `${status.vegetableName} 시세 데이터 없음`;
    case "needUnit":
      return "파는 단위를 골라주세요";
    case "needPrice":
      return "가격을 입력해주세요";
    default:
      return "";
  }
}

export function VerdictCard({ status }: { status: JudgeStatus }) {
  if (status.kind === "result") {
    const { judgement, unit, pricePerUnit, reportCount, district } = status;
    const style = RESULT_STYLE[judgement.verdict];
    const { Mark } = style;

    return (
      <section
        aria-label="판단 결과"
        className={`flex flex-col gap-4 rounded-2xl px-5 py-5 ${style.surface}`}
      >
        <div className="flex items-center gap-2">
          <span className={`shrink-0 ${style.accent} [&_svg]:size-6`} aria-hidden="true">
            <Mark />
          </span>
          {/* 낭독은 이 h2가 아니라 부모(quick-judge)의 상시 sr-only 리전이 맡는다 —
              분기마다 h2가 파괴·재생성되면 라이브 리전이 갱신으로 안 잡혀 첫 판정을 놓친다. */}
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
              {formatNumber(pricePerUnit)}원/{unit}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-fg-neutral-muted">{judgement.referenceLabel}</dt>
            <dd className="tabular-nums text-fg-neutral">
              {formatNumber(judgement.referencePrice)}원/{unit}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-fg-neutral-muted">시세 대비</dt>
            <dd className={`tabular-nums ${getDiffColorToken(judgement.pct)}`}>
              {formatDiff(judgement.pct)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-fg-neutral-muted">비교 근거</dt>
            {/* 판정 자체는 항상 공공 시세 기준(judgement.ts) — 이웃 제보 건수는 참고 정보일 뿐 판정
                근거가 아니다. 예전엔 "이웃 제보 N건"이라 적으면서 실제로는 그중 최저 1건만 썼다. */}
            <dd className="text-fg-neutral-muted">공공 시세(KAMIS)</dd>
          </div>
          {reportCount > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-fg-neutral-muted">참고할 동네 제보</dt>
              <dd className="text-fg-neutral-muted">
                {district} {reportCount}건
              </dd>
            </div>
          )}
        </dl>
      </section>
    );
  }

  if (status.kind === "noBaseline") {
    return (
      <section
        aria-label="판단 결과"
        className="flex flex-col gap-2 rounded-2xl bg-bg-neutral-weak px-5 py-6 text-center"
      >
        <h2 className="text-body-16-semibold text-fg-neutral">
          {withTopicJosa(status.vegetableName)} 지금 시세 데이터가 없어요
          {status.seasonLabel ? ` (${status.seasonLabel})` : ""}
        </h2>
        <p className="text-body-14-regular text-fg-neutral-muted">
          가격을 입력해 제보해두면 이웃에게 도움이 돼요. 아래 &lsquo;이 가격 제보하기&rsquo;로 바로
          이어져요.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="판단 결과"
      className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl bg-bg-neutral-weak px-5 py-6 text-center"
    >
      <h2 className="text-body-14-regular text-fg-neutral-muted">
        {PLACEHOLDER_COPY[status.kind]}
      </h2>
    </section>
  );
}
