import type { PriceTrend } from "../_lib/types";
import { formatNumber } from "../_lib/format";

// 전일 대비 등락 표시 — 홈 그리드·시세 헤더 공용. 인터랙션 없어 서버 렌더.
// 색은 Figma 시맨틱 토큰 `trend-up`/`trend-down`이 정한다(2026-08-05 연결) — 여기에 색을 직접 쓰지 않는다.
//   현재 값: trend-up=red-600(오름), trend-down=blue-600(내림, 증시 관례).
//   "내리면 초록(좋음)"으로 되돌리고 싶으면 `app/globals.css`의 `--color-trend-down`만 바꾸면 된다 — 이게 토큰을 쓰는 이유.
// flat은 Figma `trend-flat`(gray-400)이 흰 배경에서 대비 2.0:1로 12px 텍스트 AA에 미달해
//   `content-secondary`(4.9:1)를 유지한다.
// 화살표는 aria-hidden이고 스크린리더용 문구를 따로 둔다 — 색·기호만으로 뜻을 전하지 않는다.
//
// 2026-08-04: 퍼센트만 보여주던 걸 **금액 + 퍼센트**로 바꿨다(예: 700원 (-5.9%)).
// 5.9%가 얼마인지는 원래 가격을 알아야 나오는데, 이 라벨이 놓이는 자리(그리드 카드·시세 헤더)에는
// 그 근거가 없거나 멀다. 장바구니 판단은 원 단위로 하니 금액을 앞에 둔다.
// 변화 없음도 "어제와 같음" 문장 대신 "-" 한 글자로 — 목록에서 그 문장만 길어 눈에 걸렸다.
export function TrendLabel({ trend, size = "sm" }: { trend: PriceTrend | null; size?: "sm" | "md" }) {
  const textClass = size === "md" ? "text-body-14-medium" : "text-caption-12-regular";

  if (!trend || trend.direction === "flat") {
    return (
      <span className={`${textClass} text-content-secondary`}>
        <span aria-hidden="true">-</span>
        <span className="sr-only">어제와 같음</span>
      </span>
    );
  }

  const up = trend.direction === "up";
  return (
    <span
      className={`flex items-center gap-0.5 ${textClass} ${up ? "text-trend-up" : "text-trend-down"}`}
    >
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      <span className="sr-only">어제보다 {up ? "오름" : "내림"}, </span>
      <span className="tabular-nums">
        {formatNumber(trend.diff)}원 ({up ? "+" : "-"}
        {trend.pct}%)
      </span>
    </span>
  );
}
