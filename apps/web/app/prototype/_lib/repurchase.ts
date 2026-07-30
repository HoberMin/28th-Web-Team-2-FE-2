// 반복 구매 지원 — "지난 장보기 그대로 담기"와 "그거 살 때 됐어요"를 계산한다.
//
// 왜 필요한가: 타깃(4인 가족 장보기 담당)은 같은 품목을 주기적으로 다시 산다. 매번 장바구니를
// 새로 채우게 하는 건 "시간·노력 절약"과 반대다. 내 구매 이력에 이미 주기가 들어 있으니 쓴다.
//
// 순수 함수(서버·클라 공용). 입력은 내 제보(purchased=true)뿐이다.

import type { Report } from "./types";
import { getVegetable } from "./vegetables";

export interface ShoppingSession {
  /** 장본 날짜 "YYYY-MM-DD" */
  date: string;
  /** 그날 산 품목 + 수량 */
  items: Array<{ vegetableId: string; name: string; weightKg: number }>;
  /** 그날 지출 합계(원) */
  total: number;
}

/**
 * 내 구매 이력을 **날짜 단위 장보기 세션**으로 묶는다.
 * 같은 날 여러 품목을 산 건 한 번의 장보기로 본다 — 사용자의 기억 단위가 "그날 장 본 것"이다.
 */
export function groupShoppingSessions(myReports: Report[], limit = 5): ShoppingSession[] {
  const purchased = myReports.filter((r) => r.purchased);
  const byDate = new Map<string, Report[]>();
  for (const r of purchased) {
    const date = r.createdAt.slice(0, 10);
    const bucket = byDate.get(date);
    if (bucket) bucket.push(r);
    else byDate.set(date, [r]);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, limit)
    .map(([date, list]) => ({
      date,
      total: list.reduce((s, r) => s + r.price, 0),
      items: list.map((r) => ({
        vegetableId: r.vegetableId,
        name: getVegetable(r.vegetableId)?.name ?? r.vegetableId,
        weightKg: r.weightKg,
      })),
    }));
}

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
