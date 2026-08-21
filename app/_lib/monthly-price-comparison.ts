import type { PricePoint } from "./types";

export interface PriceComparison {
  diff: number;
  percent: number;
}

/** 기준일에서 한 달 전의 가장 가까운 수집일 가격과 비교한다. */
export function compareWithOneMonthAgo(
  points: PricePoint[],
  currentPrice?: number | null,
): PriceComparison | null {
  if (points.length < 2) return null;

  const ordered = points.toSorted((left, right) => left.date.localeCompare(right.date));
  const current = ordered.at(-1);
  if (!current) return null;

  const targetDate = shiftMonths(current.date, -1);
  const previous = ordered
    .filter((point) => point.date <= targetDate)
    .at(-1);
  if (!previous || previous.price === 0) return null;

  const latestPrice = currentPrice ?? current.price;
  const diff = latestPrice - previous.price;
  return { diff, percent: (diff / previous.price) * 100 };
}

function shiftMonths(iso: string, months: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}
