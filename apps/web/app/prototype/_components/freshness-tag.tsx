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
  // 「· 오래된 가격이에요」 문구는 2026-08-04에 뺐다(동네 제보가 목록의 「오래됨」과 같은 이유 —
  // 며칠부터 오래된 건지는 품목·사람마다 달라 우리가 기준을 정할 근거가 없었다).
  // 색(warning)과 날짜 라벨은 남긴다 — 신호는 주되 단정하지 않는다.
  return (
    <span className={`text-caption-12-regular ${STYLE[freshness.level]}`}>
      {freshness.label} 제보
    </span>
  );
}
