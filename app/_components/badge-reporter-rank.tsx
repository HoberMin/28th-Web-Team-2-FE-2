import Image from "next/image";
import { cn } from "../_lib/cn";

// Figma `badge/reporter-rank` — Design Library node 671:9967, sync 2026-08-11.
// 텍스트와 심볼을 합친 원본 export라 글자·아이콘 간격까지 Figma와 동일하다.
export type ReporterRank = "sprout" | "rookie" | "expert" | "king";

const RANK_ASSET: Record<ReporterRank, { src: string; width: number }> = {
  sprout: { src: "/figma/design-library/images/badge-reporter-sprout.png", width: 40 },
  rookie: { src: "/figma/design-library/images/badge-reporter-rookie.png", width: 67 },
  expert: { src: "/figma/design-library/images/badge-reporter-expert.png", width: 67 },
  king: { src: "/figma/design-library/images/badge-reporter-king.png", width: 52 },
};

export interface BadgeReporterRankProps {
  rank?: ReporterRank;
  className?: string;
}

export function BadgeReporterRank({ rank = "sprout", className }: BadgeReporterRankProps) {
  const asset = RANK_ASSET[rank];
  return (
    <Image
      src={asset.src}
      alt=""
      aria-hidden="true"
      width={asset.width}
      height={22}
      unoptimized
      className={cn("h-5.5 shrink-0 object-contain", className)}
    />
  );
}
