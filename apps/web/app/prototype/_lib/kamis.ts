// 공공 시세(기준선) 서버 fetch 함수 — 외부 KAMIS OpenAPI 앞단.
// ⚠️ 서버 전용: 클라이언트에서 import 금지 (인증키가 서버에만 있어야 함, conventions #7).
//    (server-only 패키지 미설치 → 주석 가드. 리뷰 시 도입 검토 권장.)
//
// 데이터 소스 판정(API 조사): KAMIS 소매가의 최소 지역 해상도는 광역(서울=1개)이라
// 동(봉천동) 단위 시세는 공공 API로 불가 → region은 광역, 동네 정밀도는 사용자 제보로 메운다.

import "server-only"; // 클라이언트에서 import 시 빌드 실패 — 인증키의 서버 격리 강제.
import { DEFAULT_REGION, getBaselineDummy, getVegetable } from "./vegetables";
import type { BaselinePrice, PricePoint, Vegetable } from "./types";

// 검증된 실호출 엔드포인트(action=periodProductList) — p_countrycode=1101(서울), p_productclscode=01(소매).
const KAMIS_ENDPOINT = "https://www.kamis.or.kr/service/price/xml.do";

/** 조회 범위: 최근 ~13개월(연도별 그래프까지 충분히 채우기 위함). */
const LOOKBACK_DAYS = 390;

interface KamisItem {
  countyname: string;
  yyyy: string;
  /** "MM/DD" */
  regday: string;
  /** "3,720" 또는 결측 "-" */
  price: string;
  kindname: string;
  marketname: string;
}

interface KamisResponseData {
  error_code: string;
  item: KamisItem[];
}

function isKamisItem(value: unknown): value is KamisItem {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.countyname === "string" &&
    typeof o.yyyy === "string" &&
    typeof o.regday === "string" &&
    typeof o.price === "string"
  );
}

/** KAMIS 응답(unknown) → 신뢰 가능한 shape로 좁힘. 모양이 다르면 null(호출부가 더미 폴백). */
function parseKamisResponse(json: unknown): KamisResponseData | null {
  if (typeof json !== "object" || json === null) return null;
  const root = json as Record<string, unknown>;
  const data = root.data;
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (typeof d.error_code !== "string") return null;
  if (!Array.isArray(d.item)) return null;
  return { error_code: d.error_code, item: d.item.filter(isKamisItem) };
}

/** "MM/DD" + "YYYY" → "YYYY-MM-DD". 형식이 안 맞으면 null. */
function toIsoDate(yyyy: string, regday: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})$/.exec(regday.trim());
  if (!m) return null;
  const month = m[1].padStart(2, "0");
  const day = m[2].padStart(2, "0");
  return `${yyyy}-${month}-${day}`;
}

/** "3,720" → 3720. 결측("-")·비숫자는 null. */
function parsePriceWon(price: string): number | null {
  const cleaned = price.replace(/,/g, "").trim();
  if (cleaned === "" || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** 배열이 min보다 짧으면 첫 값을 앞쪽으로 복제해 채운다(차트가 최소 3점을 보장받도록). */
function ensureMinPoints(points: PricePoint[], min = 3): PricePoint[] {
  if (points.length === 0 || points.length >= min) return points;
  const filler = points[0];
  const padding = Array.from({ length: min - points.length }, () => ({ ...filler }));
  return [...padding, ...points];
}

function monthKey(date: string): string {
  return date.slice(0, 7); // "YYYY-MM"
}

/** 일별 평균 포인트를 월별로 그룹핑해 월평균 12개월치 시리즈를 만든다. */
function buildYearSeries(sortedDaily: PricePoint[]): PricePoint[] {
  const groups = new Map<string, { sum: number; count: number; lastDate: string }>();
  for (const p of sortedDaily) {
    const key = monthKey(p.date);
    const g = groups.get(key);
    if (g) {
      g.sum += p.price;
      g.count += 1;
      g.lastDate = p.date;
    } else {
      groups.set(key, { sum: p.price, count: 1, lastDate: p.date });
    }
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([, g]) => ({ date: g.lastDate, price: Math.round(g.sum / g.count) }))
    .slice(-12);
}

/**
 * KAMIS 원응답 → 화면 계약(BaselinePrice)으로 정규화.
 * - `item[]`엔 "평균"(일별 평균, 채택) + 시장별 상세행("L-유통" 등, 결측 "-" 다수, 버림)이 섞여 있다.
 * - 정규화 실패·평균행 0개 → null(호출부가 더미로 폴백).
 */
function normalizeKamis(json: unknown, veg: Vegetable, region: string): BaselinePrice | null {
  const parsed = parseKamisResponse(json);
  if (!parsed || parsed.error_code !== "000") return null;

  const daily: PricePoint[] = [];
  for (const item of parsed.item) {
    if (item.countyname !== "평균") continue;
    const price = parsePriceWon(item.price);
    if (price === null) continue;
    const date = toIsoDate(item.yyyy, item.regday);
    if (!date) continue;
    daily.push({ date, price });
  }
  if (daily.length === 0) return null;

  daily.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  // 같은 날짜 중복행 방지(발생 시 마지막 값 채택).
  const dedup: PricePoint[] = [];
  for (const p of daily) {
    const last = dedup[dedup.length - 1];
    if (last && last.date === p.date) {
      last.price = p.price;
    } else {
      dedup.push(p);
    }
  }

  const week = ensureMinPoints(dedup.slice(-7));
  const month = ensureMinPoints(dedup.slice(-30));
  const year = ensureMinPoints(buildYearSeries(dedup));
  const latest = dedup[dedup.length - 1];
  const monthAvg = month.reduce((sum, p) => sum + p.price, 0) / month.length;

  return {
    vegetableId: veg.id,
    region,
    unit: veg.unit,
    current: latest.price,
    average: Math.round(monthAvg),
    series: { week, month, year },
    source: "kamis",
    asOf: latest.date,
  };
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * 품목 기준 시세를 반환한다.
 * - 인증키(KAMIS_CERT_KEY/ID) 또는 품목 매핑이 없으면 더미로 폴백 (프로토타입이 항상 동작).
 * - 실호출 실패·응답 이상(error_code≠"000")·평균행 0개도 전부 더미로 폴백.
 */
export async function getBaselinePrice(
  vegetableId: string,
  region: string = DEFAULT_REGION,
): Promise<BaselinePrice> {
  const certKey = process.env.KAMIS_CERT_KEY;
  const certId = process.env.KAMIS_CERT_ID;
  const veg = getVegetable(vegetableId);

  if (!veg || !certKey || !certId) {
    return getBaselineDummy(vegetableId, region);
  }

  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      action: "periodProductList",
      p_productclscode: "01",
      p_startday: isoDate(startDate),
      p_endday: isoDate(endDate),
      p_itemcategorycode: veg.itemCategoryCode,
      p_itemcode: veg.itemCode,
      p_countrycode: "1101",
      p_convert_kg_yn: "Y",
      p_cert_key: certKey,
      p_cert_id: certId,
      p_returntype: "json",
    });

    // 시세는 하루 1회 갱신 → revalidate 1시간(뮤테이션 없어 revalidateTag 짝은 불필요, 태그는 조회 그룹핑용).
    const res = await fetch(`${KAMIS_ENDPOINT}?${params.toString()}`, {
      next: { revalidate: 3600, tags: ["prices"] },
    });
    if (!res.ok) {
      return getBaselineDummy(vegetableId, region);
    }

    const json: unknown = await res.json();
    const normalized = normalizeKamis(json, veg, region);
    return normalized ?? getBaselineDummy(vegetableId, region);
  } catch {
    // 네트워크 실패·타임아웃·파싱 오류 등 — 프로토타입은 항상 동작해야 하므로 더미로 폴백.
    return getBaselineDummy(vegetableId, region);
  }
}
