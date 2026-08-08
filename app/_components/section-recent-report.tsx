import type { ReactNode } from "react";
import { ListRecentReport } from "./list-recent-report";
import { cn } from "../_lib/cn";

// Figma `section/recent-report` — Design Library node 392-12708 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 조합 패턴. Variant 축은 `state`(populated·empty) 하나 — 심볼 2개(392-12007 · 392-12709).
// 가게 상세 시트 안의 "최근 제보" 구획.
//
// get_design_context 실측 (두 state 공통):
//   루트   border-t border/primary · flex-col gap-[12px] items-start · pt-[16px] · w-[358px]
//          → border-t border-border-primary gap-3 pt-4 (358px는 프레임 폭이라 w-full)
//   제목   "최근 제보" · body/14-semibold · content/secondary · w-full
// state별로 아래가 갈린다:
//   populated → list/recent-report(392-11786) 인스턴스 → ListRecentReport 재사용
//   empty     → empty-state: flex h-[40px] items-center py-[10px] w-[358px] → h-10 py-2.5
//               문구 "아직 등록된 제보가 없어요 :(" · body/16-semibold · content/disabled(#b4bbcb)
//
// **빈 상태가 Figma에 실제로 있는 드문 경우다** — 임의로 만든 게 아니라 원본 심볼(392-12709)을 그대로 옮겼다.
// 문구도 Figma 값 그대로 기본값으로 두되, 화면마다 달라질 수 있어 prop으로 열었다.
// (로딩·에러 상태는 Figma에 없어서 만들지 않았다 — 화면에서 쓸 때 상위가 처리한다.)
//
// ⚠️ 대비: 빈 상태 문구 content/disabled(#b4bbcb) on 흰 배경 = **1.92:1** (16px 기준 4.5:1) → 크게 미달.
//    빈 상태 안내는 그 순간 화면에서 유일한 정보라 읽히지 않으면 타격이 큰데, Figma 원본이 이 값이다.
//    임의로 바꾸지 않고 사실만 남긴다(figma-bridge §4) — 디자이너 확인이 필요한 1순위 항목이다.
//    구획 제목 content/secondary는 4.79:1로 통과.

export type SectionRecentReportState = "populated" | "empty";

export interface SectionRecentReportProps {
  state?: SectionRecentReportState;
  /** 구획 제목. 기본값은 Figma 심볼의 문구. */
  title?: string;
  /** `state="populated"`일 때 보여 줄 `RowRecentReport` 목록. */
  children?: ReactNode[];
  /** 빈 상태 문구. 기본값은 Figma 심볼의 문구. */
  emptyMessage?: string;
  className?: string;
}

export function SectionRecentReport({
  state = "populated",
  title = "최근 제보",
  children,
  emptyMessage = "아직 등록된 제보가 없어요 :(",
  className,
}: SectionRecentReportProps) {
  return (
    <section
      className={cn(
        "flex w-full flex-col items-start gap-3 border-t border-border-primary pt-4",
        className,
      )}
    >
      <h2 className="w-full text-body-14-semibold text-content-secondary">{title}</h2>
      {state === "empty" ? (
        <div className="flex h-10 w-full items-center py-2.5">
          <p className="min-w-0 flex-1 text-body-16-semibold text-content-disabled">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <ListRecentReport label={title}>{children ?? []}</ListRecentReport>
      )}
    </section>
  );
}
