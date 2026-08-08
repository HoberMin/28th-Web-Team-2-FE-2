import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `card/news` — Design Library node 253-2136 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 없음(단일 심볼). 가로로 넘겨 보는 뉴스 카드 — 썸네일 · 제목 · 날짜.
//
// get_design_context 실측:
//   루트      flex-col items-start w-[200px] → w-50 (가로 캐러셀 칸 폭이라 고정값을 유지했다)
//   thumbnail h-[108px] w-full · radius/md(8px) · object-cover → h-27 rounded-md overflow-hidden
//   title     pt-[12px] pr-[12px] pb-[8px] pl-[4px] → pt-3 pr-3 pb-2 pl-1
//             body/16-medium · content/primary · overflow-hidden + text-ellipsis (줄 수 제한 없음)
//   date      pl-[4px] → pl-1
//             body/14-medium · content/disabled(#b4bbcb)
//
// 제목은 Figma에 `whitespace-nowrap`이 없어 여러 줄로 흐른다. 다만 카드가 나란히 놓이는 캐러셀에서
// 제목 길이가 제각각이면 높이가 흔들리므로, Figma가 잡아 둔 overflow-hidden + ellipsis의 의도를
// 살려 **두 줄에서 자른다**(line-clamp-2). row/story에서 확인한 것과 같은 처리다.
//
// ⚠️ 썸네일 이미지는 슬롯이다 — `download_assets`로만 받을 수 있고 그 경로가 레포 정책상 차단돼 있다
//    (figma-bridge §0-0). `thumbnail`에 <img>든 next/image든 넘기면 된다.
//
// ⚠️ 대비: 날짜 content/disabled(#b4bbcb) on 흰 배경 = **1.92:1** (14px 기준 4.5:1) → 미달.
//    Figma 원본 유지 + 사실만 기록한다(figma-bridge §4). 제목은 13.51:1로 통과.
//    날짜는 제목을 보조하는 정보라 색만으로 의미를 전달하진 않는다.

export interface CardNewsProps {
  /** 썸네일 슬롯. 카드 폭에 꽉 차고 108px 높이로 잘린다. */
  thumbnail?: ReactNode;
  /** 뉴스 제목. 두 줄까지 보이고 넘치면 …로 줄어든다. */
  title: string;
  /** 날짜 문자열. 예: "2026.08.01" (포맷팅은 호출자 책임) */
  date: string;
  className?: string;
}

export function CardNews({ thumbnail, title, date, className }: CardNewsProps) {
  return (
    <div className={cn("flex w-50 shrink-0 flex-col items-start", className)}>
      <span
        aria-hidden="true"
        className="flex h-27 w-full items-center justify-center overflow-hidden rounded-md"
      >
        {thumbnail}
      </span>
      <div className="flex w-full items-center justify-center pt-3 pr-3 pb-2 pl-1">
        <p className="min-w-0 flex-1 line-clamp-2 text-body-16-medium text-content-primary">
          {title}
        </p>
      </div>
      <div className="flex w-full items-center justify-center pl-1">
        <p className="min-w-0 flex-1 truncate text-body-14-medium text-content-disabled">{date}</p>
      </div>
    </div>
  );
}
