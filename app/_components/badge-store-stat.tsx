import { cn } from "../_lib/cn";

// Figma `badge/store-stat` — Design Library node 392-11448 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 축은 `metric`(affordable·today-report) 하나 — 심볼 2개(392-11447 · 392-11446).
// 가게 카드에서 "이 가게에 뭐가 몇 개 있다"를 숫자로 알리는 배지.
//
// get_design_context 실측 (두 심볼 공통):
//   gap-[4px] px-[8px] py-[4px] → gap-1 px-2 py-1
//   radius/sm(4px)              → rounded-sm
//   라벨 body/14-medium         → text-body-14-medium
//   숫자 body/14-bold           → text-body-14-bold
// 색·문구만 축에 따라 갈린다:
//   affordable   bg surface/accent-subtle(#fff8ec=orange-50) · text content/accent(#cc5002=orange-700)     · "저렴한 야채"
//   today-report bg surface/brand(#ecfdf4=green-50)          · text content/brand/dark(#064e35=green-900) · "오늘 제보된 품목"
//
// 라벨 문구는 Figma가 심볼에 고정해 둔 값이라 prop으로 열지 않았다. 숫자만 `count`로 받는다.
// 색은 루트에 한 번만 걸고 라벨·숫자가 상속받는다(Figma도 루트에 text color를 걸어 두었다).
//
// ⚠️ 대비 계산 — 14px 텍스트라 AA 기준 4.5:1:
//      affordable   #cc5002 on #fff8ec = 4.22:1 → **미달**
//      today-report #064e35 on #ecfdf4 = 9.27:1 → 통과
//    affordable 조합은 Figma 원본 그대로 두고 사실만 남긴다(figma-bridge §4).

export type BadgeStoreStatMetric = "affordable" | "today-report";

const METRIC: Record<BadgeStoreStatMetric, { className: string; label: string }> = {
  affordable: {
    className: "bg-surface-accent-subtle text-content-accent",
    label: "저렴한 야채",
  },
  "today-report": {
    className: "bg-surface-brand text-content-brand-dark",
    label: "오늘 제보된 품목",
  },
};

export interface BadgeStoreStatProps {
  metric?: BadgeStoreStatMetric;
  /** 라벨 뒤에 굵게 붙는 개수. */
  count: number;
  className?: string;
}

export function BadgeStoreStat({ metric = "affordable", count, className }: BadgeStoreStatProps) {
  const { className: metricClassName, label } = METRIC[metric];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-sm px-2 py-1",
        metricClassName,
        className,
      )}
    >
      <span className="text-body-14-medium">{label}</span>
      <span className="text-body-14-bold">{count}</span>
    </span>
  );
}
