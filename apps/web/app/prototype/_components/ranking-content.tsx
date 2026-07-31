"use client";

import Link from "next/link";
import { buildReporterRanking, type ReporterRankEntry } from "../_lib/ranking";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { DefaultProfileAvatar } from "./profile-avatar";
import { EmptyState } from "./empty-state";

// F06 랭킹 — 제보왕 단독 화면(백로그 F06 재편). "싼 가게"는 가게(F07) 탭으로,
// "최저가 품목"은 홈으로 옮겼다. 실제 제보(reports-store) 집계라 내가 제보하면 바로 순위가 오른다.
//
// 클라 스토어 특성상 첫 페인트엔 아직 위치를 몰라 목록이 비어 있다(공통 백로그 #1) —
// `useCurrentDistrict().loading`으로 "아직 안 불러왔다"와 "불러왔는데 없다"를 구분해서
// 빈 상태가 잘못 깜빡이지 않게 한다.
export function RankingContent() {
  const { district, loading } = useCurrentDistrict();
  const reports = useReports({ district });
  const ranking = buildReporterRanking(reports);
  // TOP3는 포디움으로 한눈에 보여주고, 4위부터만 리스트로 잇는다 — 상세는 어느 쪽이든 같은
  // 목적지(reporter/[닉네임])로 간다(백로그 F06 재편, 2026-07-31 포디움 도입).
  const podium = ranking.filter((r) => r.rank <= 3);
  const rest = ranking.filter((r) => r.rank > 3);

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
        <>
          <RankingPodium entries={podium} />
          {rest.length > 0 && (
            <ol className="flex flex-col gap-2">
              {rest.map((r) => (
                <ReporterRow key={r.nickname} entry={r} />
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}

/** 포디움 순위는 항상 1~3만 온다(podium = ranking.filter(rank<=3)) — 타입으로 그 불변식을 드러낸다. */
type PodiumRank = 1 | 2 | 3;

/** 스테이지 순서(2-1-3 계단)·높이·색 — 1위가 가운데·제일 높고 브랜드색, 2·3위는 좌우로 낮게. */
const PODIUM_ORDER: Record<PodiumRank, string> = { 1: "order-2", 2: "order-1", 3: "order-3" };
const PODIUM_HEIGHT: Record<PodiumRank, string> = { 1: "h-32", 2: "h-24", 3: "h-20" };
const PODIUM_STAGE_BG: Record<PodiumRank, string> = {
  1: "bg-bg-brand-solid",
  2: "bg-bg-neutral-inverted",
  3: "bg-bg-neutral-inverted",
};

/**
 * TOP3 포디움 — 리스트를 스크롤하지 않아도 순위를 한눈에 보여준다(2026-07-31 신설).
 * entries는 1~3개 다 온다는 보장이 없다(초반 제보왕이 1~2명뿐일 수 있음) — 있는 만큼만
 * 슬롯을 그리고, 순서는 CSS order로 고정하기 때문에 2위가 없어도 1위가 어긋나지 않는다.
 * 4위+ 리스트와 마찬가지로 `<ol>`로 감싼다 — 순위라는 같은 성격의 목록이라 스크린리더가
 * "n개 항목" 그룹으로 안내해야 한다.
 */
function RankingPodium({ entries }: { entries: ReporterRankEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <ol className="flex items-end justify-center gap-2 pt-1 pb-2">
      {entries.map((entry) => (
        <PodiumSlot key={entry.nickname} entry={entry} />
      ))}
    </ol>
  );
}

function PodiumSlot({ entry }: { entry: ReporterRankEntry }) {
  const rank = entry.rank as PodiumRank;
  const avatarSize = rank === 1 ? 56 : 44;

  return (
    <li className={PODIUM_ORDER[rank]}>
      <Link
        href={`/prototype/reporter/${encodeURIComponent(entry.nickname)}`}
        className="flex w-24 flex-col items-center gap-1.5 rounded-2xl active:opacity-80"
      >
        {rank === 1 ? (
          <span className="text-head1-24 leading-none" aria-hidden="true">
            👑
          </span>
        ) : (
          <span className="h-6" aria-hidden="true" />
        )}
        {/* 야채 아바타 대신 기본 프로필 실루엣 — 랭킹은 여러 사람이 나란히 뜨는 자리라,
            개인화 야채 아이콘을 그대로 쓰면 "이 사람이 감자다"가 아니라 "감자가 순위에
            있다"로 읽힌다(2026-07-31). 마이페이지·설정·제보자 프로필처럼 1명만 보이는
            화면은 야채 아바타를 그대로 쓴다 — 이 교체는 랭킹에만 적용한다. */}
        <span className="rounded-full ring-4 ring-bg-layer-default">
          <DefaultProfileAvatar size={avatarSize} variant="rank" />
        </span>
        <div
          className={`flex w-full flex-col items-center gap-0.5 rounded-t-2xl pt-3 ${PODIUM_HEIGHT[rank]} ${PODIUM_STAGE_BG[rank]}`}
        >
          <span className="text-caption-12-medium tabular-nums text-fg-neutral-inverted">{entry.rank}</span>
          <span className="max-w-full truncate px-1 text-body-14-medium text-fg-neutral-inverted">
            {entry.nickname}
          </span>
          <span className="text-caption-12-regular tabular-nums text-fg-neutral-inverted">
            {entry.reportCount}건
          </span>
        </div>
      </Link>
    </li>
  );
}

/** 4위부터의 리스트 행 — TOP3는 포디움이 맡으므로 여기 오는 entry는 항상 4위 이상이다. */
function ReporterRow({ entry }: { entry: ReporterRankEntry }) {
  return (
    <li>
      <Link
        href={`/prototype/reporter/${encodeURIComponent(entry.nickname)}`}
        className="flex items-center gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3 active:bg-bg-neutral-weak-pressed"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-body-14-medium tabular-nums text-fg-neutral">
          {entry.rank}
        </span>
        <DefaultProfileAvatar size={40} variant="list" />
        <span className="min-w-0 flex-1 truncate text-body-14-regular text-fg-neutral">{entry.nickname}</span>
        <span className="shrink-0 tabular-nums text-body-16-semibold text-fg-neutral">
          제보 {entry.reportCount}건
        </span>
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
