import type { ReactNode } from "react";
import { BadgeReportDate, type BadgeReportDateVariant } from "./badge-report-date";
import { VegetablePrice } from "./vegetable-price";
import { cn } from "../_lib/cn";

// Figma `row/recent-report` — Design Library node 359-18537 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 축은 `badge`(있음·없음) 하나. 최근 제보 목록의 한 행 —
// 야채 그림 · 이름 · (제보 시점 배지) · 가격.
// `list/recent-report`(392-11786)가 이걸 세로로 쌓는다.
//
// get_design_context 실측:
//   루트        flex items-center justify-between w-[358px] → items-center justify-between (w-full)
//   leading     flex gap-[8px] items-center → gap-2
//   야채 묶음   flex gap-[12px] items-center → gap-3
//   야채 그림   40×40 → size-10 슬롯
//   info        flex-col gap-[2px] w-[140px] → gap-0.5 w-35
//     이름      body/16-semibold · content/primary · 한 줄 말줄임
//   trailing    flex gap-[8px] items-center → gap-2
//     배지      badge/report-date(359-18591) 그대로 재사용
//     price     flex-col gap-[2px] items-end w-[112px] → gap-0.5 w-28
//               text/vegetable-price size=16(body/16-bold) lines=1, 오른쪽 정렬
//   → 배지·가격은 이미 구현된 BadgeReportDate·VegetablePrice를 재사용한다.
//
// list/recent-report 심볼 안의 두 행이 각각 date=today / date=yesterday라서,
// 배지의 today·yesterday 두 값이 실제로 이 행에서 쓰이는 것을 확인했다.
//
// ⚠️ 야채 그림은 슬롯으로 비워 뒀다 — 에셋 다운로드가 정책상 차단돼 있다(figma-bridge §0-0).
//
// ⚠️ 대비: 단위 표기 content/disabled(#b4bbcb) on 흰 배경 = 1.92:1 (기준 4.5:1) → 미달.
//    배지 자체의 미달값은 badge-report-date.tsx에 기록했다. 모두 Figma 원본 유지다.

export interface RowRecentReportProps {
  /** 야채 그림 슬롯(40×40). */
  visual: ReactNode;
  /** 야채 이름. */
  name: string;
  /** 제보 시점 배지. 생략하면 배지를 그리지 않는다(Figma의 badge=false). */
  reportDate?: BadgeReportDateVariant;
  /** 가격 문자열. 예: "99,900원" */
  price: string;
  /** 단위 문자열. 예: "/100kg" */
  unit: string;
  className?: string;
}

export function RowRecentReport({
  visual,
  name,
  reportDate,
  price,
  unit,
  className,
}: RowRecentReportProps) {
  return (
    <div className={cn("flex w-full items-center justify-between", className)}>
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center overflow-hidden"
          >
            {visual}
          </span>
          <div className="flex w-35 min-w-0 flex-col items-start gap-0.5">
            <p className="w-full truncate text-body-16-semibold text-content-primary">{name}</p>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {reportDate ? <BadgeReportDate date={reportDate} /> : null}
        <div className="flex w-28 shrink-0 flex-col items-end gap-0.5">
          <VegetablePrice value={price} unit={unit} size="16" lines={1} className="justify-end" />
        </div>
      </div>
    </div>
  );
}
