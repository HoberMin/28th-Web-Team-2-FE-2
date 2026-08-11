import { BadgeReporterRank, type ReporterRank } from "../../_components/badge-reporter-rank";
import type { Story } from "./types";

const RANKS: ReporterRank[] = ["sprout", "rookie", "expert", "king"];

function BadgeReporterRankStory() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {RANKS.map((rank) => (
        <div key={rank} className="flex flex-col items-center gap-2">
          <BadgeReporterRank rank={rank} />
          <span className="text-caption-12-regular text-content-secondary">{rank}</span>
        </div>
      ))}
    </div>
  );
}

export const badgeReporterRankStory: Story = {
  id: "badge-reporter-rank",
  title: "Badge Reporter Rank",
  group: "컴포넌트",
  figma: "node 671-9967",
  description: "제보자의 활동 등급과 전용 심볼을 함께 보여줘요.",
  Component: BadgeReporterRankStory,
};
