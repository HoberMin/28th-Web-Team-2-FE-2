import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `badge/map-location` — `화면GUI` F03 인스턴스 298-3611 (main component 298-3315),
// fileKey d5j7K9BNpSXxVUu3fmZfY4, sync 2026-08-08. 신규 컴포넌트. Variant 없음(단일 심볼).
// 지도 위 왼쪽 위에 떠서 "지금 보고 있는 지역"을 알려 주는 어두운 알약이다.
//
// get_design_context 실측:
//   루트   bg surface/elevated(gray/700 90%) · radius/md(8px)
//          gap-[4px] items-center · pl-[8px] pr-[12px] py-[4px]
//          → gap-1 rounded-md bg-surface-elevated pl-2 pr-3 py-1
//   아이콘 icon/map-pin-fill 16×16
//   텍스트 body/14-medium · content/inverse(#f9f9fb)
//
// ⚠️ **좌우 패딩이 비대칭인 게 의도다** — 핀 아이콘 쪽 8, 텍스트 쪽 12. 아이콘의 시각 여백이
//    글자보다 커서 좌우를 같게 주면 왼쪽이 더 비어 보인다. 실측 그대로 옮겼다.
//
// ⚠️ 크기는 **hug**다. Figma 실측 76×30("광진구")이지만 이건 글자 수의 결과값이지 규격이 아니다.
//    특히 높이 30은 `14px × 1.55 + py 8`의 반올림이라 **고정 높이로 넘기지 않는다** —
//    글자가 바뀌거나 사용자가 폰트를 키우면 따라 커져야 한다.
//
// 핀 아이콘(icon/map-pin-fill)은 슬롯으로 받는다 — 원본 SVG는
//    `public/figma/design-library/icons/map-pin-fill.svg`에 있다. currentColor를 쓰는 16×16 SVG를
//    넘겨받는다고 가정한다.
//
// ⚠️ **표시 전용이다(`<div>`).** 지역을 바꾸는 진입점처럼 보이지만 Figma에 hover·pressed·disabled
//    심볼이 하나도 없다. 눌리는 규격이 확인되지 않은 상태에서 상태를 추측해 만들지 않았다.
//    지역 변경 진입점으로 확정되면 `<button>`으로 승격해야 한다(디자이너 확인 항목).
//
// ⚠️ 대비: content/inverse(#f9f9fb) on surface/elevated — 감사 실측 5.5:1(지도 위 합성 기준),
//    불투명 gray/700 단색 기준으로 다시 계산하면 7.09:1. 어느 쪽이든 본문 기준 4.5:1 통과.

export interface BadgeMapLocationProps {
  /** 지역 이름. 예: "광진구" */
  label: string;
  /** 핀 아이콘 슬롯(16×16). 위 ⚠️ 참고 — currentColor SVG를 넘긴다. */
  icon?: ReactNode;
  className?: string;
}

export function BadgeMapLocation({ label, icon, className }: BadgeMapLocationProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-surface-elevated py-1 pr-3 pl-2 text-body-14-medium text-content-inverse",
        className,
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
          {icon}
        </span>
      ) : null}
      <p className="min-w-0 truncate">{label}</p>
    </div>
  );
}
