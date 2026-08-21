import Image from "next/image";
import { cn } from "../_lib/cn";

// Figma `badge/reporter-rank` — Design Library node 671:9967, sync 2026-08-11.
// 등급명은 프로젝트와 같은 Wanted Sans body/14-semibold로 렌더하고, 등급별 심볼만
// Figma 하위 노드(671:7101·7256·7251·6700)에서 SVG로 export해 사용한다.
// 전체 배지를 1배 PNG로 쓰면 텍스트까지 래스터화돼 브라우저 글자보다 흐려진다.
//
// 등급명은 Figma 최신 컴포넌트의 토큰을 따른다. sprout/rookie는 rank 토큰을 쓰고,
// expert/king은 각각 content/brand-medium·content/accent-badge를 사용한다.
// 심볼은 컴포넌트의 24px 슬롯 안에서 원본 크기로 가운데 정렬한다.
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
    iconSlotClassName: "size-6",
    textClassName: "text-content-rank-sprout",
  },
  rookie: {
    label: "제보 초보",
    icon: "/figma/design-library/icons/badge-reporter-rookie.svg",
    iconWidth: 14,
    iconHeight: 12,
    iconSlotClassName: "size-6",
    textClassName: "text-content-rank-rookie",
  },
  expert: {
    label: "제보 고수",
    icon: "/figma/design-library/icons/badge-reporter-expert.svg",
    iconWidth: 12,
    iconHeight: 12,
    iconSlotClassName: "size-6",
    textClassName: "text-content-brand-medium",
  },
  king: {
    label: "제보왕",
    icon: "/figma/design-library/icons/badge-reporter-king.svg",
    iconWidth: 14,
    iconHeight: 10,
    iconSlotClassName: "size-6",
    textClassName: "text-content-accent-badge",
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
