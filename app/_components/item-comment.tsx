import { BadgeReporterRank, type ReporterRank } from "./badge-reporter-rank";
import { ImageProfileReporter, type ReporterTone } from "./image-profile-reporter";
import { cn } from "../_lib/cn";

// Figma `item/comment` — Design Library node 690:10760, sync 2026-08-11.
// 44px 프로필 + 8px 간격 + py 16px + 하단 secondary border 구성이다.
export interface ItemCommentProps {
  nickname: string;
  rank: ReporterRank;
  age: string;
  body: string;
  profileColor?: ReporterTone;
  className?: string;
}

export function ItemComment({
  nickname,
  rank,
  age,
  body,
  profileColor = "green",
  className,
}: ItemCommentProps) {
  return (
    <article className={cn("flex w-full items-start gap-2 border-b border-border-secondary py-4", className)}>
      <ImageProfileReporter color={profileColor} className="rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h3 className="text-body-14-bold text-content-primary">{nickname}</h3>
            <BadgeReporterRank rank={rank} />
          </div>
          <p className="text-caption-12-medium text-content-disabled">{age}</p>
        </div>
        <p className="text-body-14-regular whitespace-pre-wrap text-content-primary">{body}</p>
      </div>
    </article>
  );
}
