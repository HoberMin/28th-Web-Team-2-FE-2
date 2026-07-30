// 반복 구매 지원 — "그거 살 때 됐어요"를 계산한다.
//
// 왜 필요한가: 타깃(4인 가족 장보기 담당)은 같은 품목을 주기적으로 다시 산다. 시세를 보려고
// 매번 앱을 열게 하는 대신, 내 구매 이력에 이미 들어 있는 주기를 써서 먼저 알려준다.
//
// 순수 함수(서버·클라 공용). 입력은 내 제보(purchased=true)뿐이다.

import type { Report } from "./types";
import { getVegetable } from "./vegetables";

export interface RepurchaseHint {
  vegetableId: string;
  name: string;
  emoji: string;
  image?: string;
  /** 추정 재구매 주기(일). 이력이 2건 미만이면 기본값 14일 */
  intervalDays: number;
  /** 마지막 구매 후 지난 일수 */
  daysSince: number;
  /** 주기를 넘겼는지 */
  due: boolean;
}

/**
 * 품목별 재구매 시점을 추정한다.
 * 같은 품목을 2번 이상 산 이력이 있으면 **구매 간격의 평균**을 주기로 쓰고,
 * 1번뿐이면 추정 근거가 없어 기본 14일을 쓴다(가정임을 화면에서 밝힌다).
 */
export function getRepurchaseHints(
  myReports: Report[],
  todayIso: string,
  limit = 4,
): RepurchaseHint[] {
  const purchased = myReports.filter((r) => r.purchased);
  const byItem = new Map<string, string[]>();
  for (const r of purchased) {
    const dates = byItem.get(r.vegetableId) ?? [];
    dates.push(r.createdAt.slice(0, 10));
    byItem.set(r.vegetableId, dates);
  }

  const today = Date.parse(todayIso);
  const hints: RepurchaseHint[] = [];

  for (const [vegetableId, rawDates] of byItem) {
    const veg = getVegetable(vegetableId);
    if (!veg) continue;
    const dates = [...new Set(rawDates)].sort();
    const last = dates[dates.length - 1];
    const daysSince = Math.max(0, Math.round((today - Date.parse(last)) / 86_400_000));

    let intervalDays = 14;
    if (dates.length >= 2) {
      let sum = 0;
      for (let i = 1; i < dates.length; i++) {
        sum += (Date.parse(dates[i]) - Date.parse(dates[i - 1])) / 86_400_000;
      }
      intervalDays = Math.max(3, Math.round(sum / (dates.length - 1)));
    }

    hints.push({
      vegetableId,
      name: veg.name,
      emoji: veg.emoji,
      image: veg.image,
      intervalDays,
      daysSince,
      due: daysSince >= intervalDays,
    });
  }

  // 많이 지난 것부터 — 주기를 넘긴 품목이 위로 온다
  return hints
    .sort((a, b) => b.daysSince - b.intervalDays - (a.daysSince - a.intervalDays))
    .slice(0, limit);
}
