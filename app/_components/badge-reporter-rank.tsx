import Image from "next/image";
import { cn } from "../_lib/cn";

// Figma `badge/reporter-rank` — Design Library node 671:9967, sync 2026-08-11.
// 등급명은 프로젝트와 같은 Wanted Sans body/14-semibold로 렌더하고, 등급별 심볼만
// Figma 하위 노드(671:7101·7256·7251·6700)에서 SVG로 export해 사용한다.
// 전체 배지를 1배 PNG로 쓰면 텍스트까지 래스터화돼 브라우저 글자보다 흐려진다.
//
// 색: variables v03(2026-08-13)이 신설한 `content/rank/*` 전용 토큰을 쓴다.
// 이전엔 등급명 글자를 범용 토큰(content/secondary·brand-medium·accent)으로 근사했는데,
// 그게 **같은 배지 안의 심볼과 색이 달랐다** — 심볼 SVG는 이미 expert `#10B972`(green/500)·
// king `#FFA132`(orange/400)로, v03 rank 토큰과 정확히 같은 값이다. 글자만 green/700·orange/700로
// 더 진했던 것이다. 그래서 이 변경은 "색을 밝힌 것"이 아니라 **글자를 심볼에 맞춘 정합**이다.
// ⚠️ 다만 그 결과 등급명 텍스트 대비가 AA(4.5:1) 아래다: king 2.02 · expert 2.56 · sprout 1.92.
//    글자·심볼을 어느 쪽으로 통일할지는
//    디자인_docs/feedback/0813-v2/디자인시스템-리뷰.md 2번에서 디자이너 확인 대기 중.
export type ReporterRank = "sprout" | "rookie" | "expert" | "king";

const RANK: Record<ReporterRank, {
  label: string;
  icon: string;
  iconWidth: number;
  iconHeight: number;
  iconSlotClassName: string;
  textClassName: string;
}> = {
  sprout: {
    label: "새싹",
    icon: "/figma/design-library/icons/badge-reporter-sprout.svg",
    iconWidth: 14,
    iconHeight: 9,
    iconSlotClassName: "h-[9px] w-3.5",
    textClassName: "text-content-rank-sprout",
  },
  rookie: {
    label: "제보 초보",
    icon: "/figma/design-library/icons/badge-reporter-rookie.svg",
    iconWidth: 14,
    iconHeight: 12,
    iconSlotClassName: "h-3 w-3.5",
    textClassName: "text-content-rank-rookie",
  },
  expert: {
    label: "제보 고수",
    icon: "/figma/design-library/icons/badge-reporter-expert.svg",
    iconWidth: 12,
    iconHeight: 12,
    iconSlotClassName: "size-3.5",
    textClassName: "text-content-rank-expert",
  },
  king: {
    label: "제보왕",
    icon: "/figma/design-library/icons/badge-reporter-king.svg",
    iconWidth: 14,
    iconHeight: 10,
    iconSlotClassName: "h-2.5 w-3.5",
    textClassName: "text-content-rank-king",
  },
};

export interface BadgeReporterRankProps {
  rank?: ReporterRank;
  className?: string;
}

export function BadgeReporterRank({ rank = "sprout", className }: BadgeReporterRankProps) {
  const value = RANK[rank];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-0.5", className)}>
      <span className={cn("text-body-14-semibold whitespace-nowrap", value.textClassName)}>
        {value.label}
      </span>
      <span className={cn("flex shrink-0 items-center justify-center", value.iconSlotClassName)}>
        <Image
          src={value.icon}
          alt=""
          aria-hidden="true"
          width={value.iconWidth}
          height={value.iconHeight}
          unoptimized
        />
      </span>
    </span>
  );
}
