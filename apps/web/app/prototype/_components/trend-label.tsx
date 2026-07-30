import type { PriceTrend } from "../_lib/types";

// 전일 대비 등락 표시 — 홈 그리드·시세 헤더 공용. 인터랙션 없어 서버 렌더.
// 색은 시세 관례를 따른다: 오르면 빨강(사는 사람에게 나쁨), 내리면 초록(좋음).
// 화살표는 aria-hidden이고 스크린리더용 문구를 따로 둔다 — 색·기호만으로 뜻을 전하지 않는다.
export function TrendLabel({ trend, size = "sm" }: { trend: PriceTrend | null; size?: "sm" | "md" }) {
  const textClass = size === "md" ? "text-body-14-medium" : "text-caption-12-regular";

  if (!trend || trend.direction === "flat") {
    return <span className={`${textClass} text-fg-neutral-muted`}>어제와 같음</span>;
  }

  const up = trend.direction === "up";
  return (
    <span className={`flex items-center gap-0.5 ${textClass} ${up ? "text-fg-critical" : "text-fg-positive"}`}>
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      <span className="sr-only">어제보다 {up ? "오름" : "내림"}, </span>
      <span className="tabular-nums">{trend.pct}%</span>
    </span>
  );
}
