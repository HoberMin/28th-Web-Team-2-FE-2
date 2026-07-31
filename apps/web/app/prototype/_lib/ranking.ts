// 랭킹(F06) — 제보왕 단독 화면(백로그 F06 재편). 싼 가게·최저가 품목 더미는 제거했다
// (각각 가게 탭·홈에 이미 있는 기능이라 여기 중복 데이터를 둘 이유가 없다).

import type { Report } from "./types";
import { AVATAR_OPTIONS } from "../_components/profile-avatar";

/** 실제 집계된 제보왕 순위 한 줄. */
export interface ReporterRankEntry {
  rank: number;
  nickname: string;
  /** `profile-avatar.tsx`의 `AVATAR_OPTIONS` id — 닉네임에서 결정적으로 뽑는다(무작위 아님). */
  avatarId: string;
  reportCount: number;
}

/** 문자열 → 안정적 seed (다른 파일의 동명 함수와 동일한 알고리즘 — 결정적 더미 생성 공통 패턴). */
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return h;
}

/** 닉네임에서 결정적으로 아바타를 고른다 — 같은 닉네임은 항상 같은 아바타. */
export function pickAvatarId(nickname: string): string {
  const options = AVATAR_OPTIONS;
  if (options.length === 0) return "";
  return options[hashSeed(nickname) % options.length].id;
}

/**
 * 제보왕 실데이터 집계 — 현재 동 제보(mine·이웃 구분 없이)를 닉네임별로 세어 순위를 만든다.
 * 호출부가 이미 동 단위로 필터링한 `Report[]`를 넘겨야 한다(이 함수는 동 필터링을 하지 않는다 —
 * `useReports({ district })`가 동 필터를 담당).
 * 동점(제보 수 동일)이면 닉네임 가나다순으로 안정 정렬한다.
 */
export function buildReporterRanking(reports: Report[]): ReporterRankEntry[] {
  const counts = new Map<string, number>();
  for (const r of reports) {
    counts.set(r.nickname, (counts.get(r.nickname) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([aName, aCount], [bName, bCount]) => bCount - aCount || aName.localeCompare(bName, "ko"))
    .map(([nickname, reportCount], i) => ({
      rank: i + 1,
      nickname,
      avatarId: pickAvatarId(nickname),
      reportCount,
    }));
}
