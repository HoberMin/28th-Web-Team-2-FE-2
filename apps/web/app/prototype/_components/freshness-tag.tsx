import type { ReportAgeInfo } from "../_lib/stores";

// 제보 시점 표시(구 "신선도") — 야채 가격은 주 단위로 움직여서, 낡은 제보를 새 제보와 같은 무게로
// 보여주면 오히려 잘못된 판단을 부른다. 오늘 제보는 진하게, 1주일 넘은 제보는 흐리게 + 명시적으로 경고.
// prop명(freshness)은 유지 — `_lib/stores.ts`의 필드명과 맞춘 것(소비처가 여럿이라 필드명 자체는 안 바꿨다).
const STYLE: Record<ReportAgeInfo["level"], string> = {
  today: "text-fg-positive",
  recent: "text-fg-neutral-muted",
  stale: "text-fg-warning",
};

export function FreshnessTag({ freshness }: { freshness: ReportAgeInfo }) {
  return (
    <span className={`text-caption-12-regular ${STYLE[freshness.level]}`}>
      {freshness.label} 제보
      {freshness.level === "stale" && <span className="ml-1">· 오래된 가격이에요</span>}
    </span>
  );
}
