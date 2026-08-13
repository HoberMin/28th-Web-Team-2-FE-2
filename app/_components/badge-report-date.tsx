import { cn } from "../_lib/cn";

// Figma `badge/report-date` — Design Library node 359-18591 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 축은 `date`(today·yesterday) 하나 — 심볼 2개(359-18590 · 359-18589).
// 제보가 언제 들어온 값인지 알리는 텍스트 배지. `row/recent-report`(359-18537)가 실사용처다.
//
// get_design_context 실측 (두 심볼 공통):
//   px-[8px] py-[2px]  → px-2 py-0.5
//   radius/sm(4px)     → rounded-sm
//   caption/12-semibold → text-caption-12-semibold
// 색만 축에 따라 갈린다:
//   today     bg surface/accent(#fff0d3=orange-100)     · text content/accent(#cc5002=orange-700)   · "오늘"
//   yesterday bg surface/secondary(#f2f3f8=gray-100)    · text content/secondary(#697383=gray-600)  · "어제"
//
// 라벨 문구도 Figma가 심볼에 고정해 둔 값이라(today="오늘", yesterday="어제") prop으로 열지 않았다.
//
// ⚠️ 대비 계산 — 12px 텍스트라 AA 기준 4.5:1인데 **두 variant 다 미달**이다:
//      today     #cc5002 on #fff0d3 = 3.96:1
//      yesterday #697383 on #f2f3f8 = 4.33:1
//    Figma 원본 조합을 그대로 두고 사실만 남긴다(figma-bridge §4 — 임의로 색을 바꾸지 않는다).
//    다만 이 배지는 "오늘/어제"라는 글자 자체가 정보를 담고 색은 강조일 뿐이라 색 단독 의존
//    (WCAG 1.4.1)은 아니다.

export type BadgeReportDateVariant = "today" | "yesterday";

const VARIANT: Record<BadgeReportDateVariant, { className: string; text: string }> = {
  today: { className: "bg-surface-accent-orange text-content-accent-badge", text: "오늘" },
  yesterday: { className: "bg-surface-secondary text-content-secondary", text: "어제" },
};

export interface BadgeReportDateProps {
  date?: BadgeReportDateVariant;
  className?: string;
}

export function BadgeReportDate({ date = "today", className }: BadgeReportDateProps) {
  const { className: variantClassName, text } = VARIANT[date];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm px-2 py-0.5 text-caption-12-semibold",
        variantClassName,
        className,
      )}
    >
      {text}
    </span>
  );
}
