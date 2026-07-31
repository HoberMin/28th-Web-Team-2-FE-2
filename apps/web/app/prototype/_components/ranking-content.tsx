"use client";

import Link from "next/link";
import { buildReporterRanking, type ReporterRankEntry } from "../_lib/ranking";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { ProfileAvatar } from "./profile-avatar";
import { EmptyState } from "./empty-state";

// F06 랭킹 — 제보왕 단독 화면(백로그 F06 재편). "싼 가게"는 매장(F07) 탭으로,
// "최저가 품목"은 홈으로 옮겼다. 실제 제보(reports-store) 집계라 내가 제보하면 바로 순위가 오른다.
//
// 클라 스토어 특성상 첫 페인트엔 아직 위치를 몰라 목록이 비어 있다(공통 백로그 #1) —
// `useCurrentDistrict().loading`으로 "아직 안 불러왔다"와 "불러왔는데 없다"를 구분해서
// 빈 상태가 잘못 깜빡이지 않게 한다.
export function RankingContent() {
  const { district, loading } = useCurrentDistrict();
  const reports = useReports({ district });
  const ranking = buildReporterRanking(reports);

  return (
    <div className="flex flex-col gap-3 px-4 pt-1 pb-6">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-head2-16 text-fg-neutral">이번 주 랭킹</h2>
        <p className="text-caption-12-regular text-fg-neutral-muted">{district} 기준 · 제보 건수 순</p>
      </div>

      {loading ? (
        <RankingLoading />
      ) : ranking.length === 0 ? (
        <EmptyState>
          아직 {district}에 제보왕이 없어요.
          <br />
          첫 제보를 남기면 1위가 될 수 있어요.
        </EmptyState>
      ) : (
        <ol className="flex flex-col gap-2">
          {ranking.map((r) => (
            <ReporterRow key={r.nickname} entry={r} />
          ))}
        </ol>
      )}
    </div>
  );
}

/** 1·2·3위는 배지 색·아바타 크기로 구분한다 — 세부 표현은 디자이너 몫(백로그 F06). */
function ReporterRow({ entry }: { entry: ReporterRankEntry }) {
  const isTop3 = entry.rank <= 3;
  const avatarSize = entry.rank === 1 ? 52 : isTop3 ? 44 : 40;
  const badgeClass =
    entry.rank === 1
      ? "bg-bg-brand-solid text-palette-static-white"
      : isTop3
        ? "bg-bg-brand-weak text-fg-brand-contrast"
        : "text-fg-neutral";
  const countClass =
    entry.rank === 1
      ? "text-head2-18 text-fg-brand-contrast"
      : "text-body-16-semibold text-fg-neutral";

  return (
    <li>
      <Link
        href={`/prototype/reporter/${encodeURIComponent(entry.nickname)}`}
        className="flex items-center gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3 active:bg-bg-neutral-weak-pressed"
      >
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-body-14-medium tabular-nums ${badgeClass}`}
        >
          {entry.rank}
        </span>
        <ProfileAvatar avatarId={entry.avatarId} size={avatarSize} />
        <span className="min-w-0 flex-1 truncate text-body-14-regular text-fg-neutral">{entry.nickname}</span>
        <span className={`shrink-0 tabular-nums ${countClass}`}>제보 {entry.reportCount}건</span>
      </Link>
    </li>
  );
}

/** 위치를 아직 못 불러온 동안의 자리표시 — 빈 상태와 다른 모양이어야 깜빡임으로 안 읽힌다. */
function RankingLoading() {
  return (
    <ol className="flex flex-col gap-2" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="h-16 animate-pulse rounded-2xl bg-bg-neutral-weak" />
      ))}
    </ol>
  );
}
