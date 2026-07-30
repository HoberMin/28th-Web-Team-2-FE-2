// 공공 시세(기준선) 서버 fetch 함수 — 외부 KAMIS OpenAPI 앞단.
// ⚠️ 서버 전용: 클라이언트에서 import 금지 (인증키가 서버에만 있어야 함, conventions #7).
//    (server-only 패키지 미설치 → 주석 가드. 리뷰 시 도입 검토 권장.)
//
// 데이터 소스 판정(API 조사): KAMIS 소매가의 최소 지역 해상도는 광역(서울=1개)이라
// 동(봉천동) 단위 시세는 공공 API로 불가 → region은 광역, 동네 정밀도는 사용자 제보로 메운다.

import "server-only"; // 클라이언트에서 import 시 빌드 실패 — 인증키의 서버 격리 강제.
import { DEFAULT_REGION, getBaselineDummy, getVegetable } from "./vegetables";
import type { BaselinePrice, PricePeriod, PricePoint, Vegetable } from "./types";

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
    isFallback: false,
  };
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * 품종코드 하나로 KAMIS를 1회 조회한다. 실패·결측이면 null(호출부가 판단).
 * 단위 정책(규격 §단위 정책): kg·g는 kg 환산(Y), 개·포기는 소비자가 그 단위로 사므로 환산하지 않는다(N).
 * 등급은 04(상품) 고정 — 05(중품)는 표본이 얇아 며칠씩 값이 안 바뀌는 등 품질이 낮았다.
 */
async function fetchOneKind(
  veg: Vegetable,
  region: string,
  kindCode: string,
  startDay: string,
  endDay: string,
  certKey: string,
  certId: string,
): Promise<BaselinePrice | null> {
  const convertKg = veg.unitType === "kg" || veg.unitType === "g" ? "Y" : "N";
  const params = new URLSearchParams({
    action: "periodProductList",
    p_productclscode: "01",
    p_startday: startDay,
    p_endday: endDay,
    p_itemcategorycode: veg.itemCategoryCode,
    p_itemcode: veg.itemCode,
    p_kindcode: kindCode,
    p_productrankcode: "04",
    p_countrycode: "1101",
    p_convert_kg_yn: convertKg,
    p_cert_key: certKey,
    p_cert_id: certId,
    p_returntype: "json",
  });

  // 시세는 하루 1회 갱신 → revalidate 1시간(뮤테이션 없어 revalidateTag 짝은 불필요, 태그는 조회 그룹핑용).
  const res = await fetch(`${KAMIS_ENDPOINT}?${params.toString()}`, {
    next: { revalidate: 3600, tags: ["prices"] },
  });
  if (!res.ok) return null;
  const json: unknown = await res.json();
  return normalizeKamis(json, veg, region);
}

/**
 * 여러 시즌 품종의 기준선을 평균한다(배추·무 — 동시에 두 시즌이 살아있는 전환기용).
 * 시리즈는 날짜 교집합이 보장되지 않아 **날짜별로 있는 값만** 평균한다.
 */
function averageBaselines(list: BaselinePrice[]): BaselinePrice {
  const head = list[0];
  const mergePeriod = (period: PricePeriod): PricePoint[] => {
    const byDate = new Map<string, number[]>();
    for (const b of list) {
      for (const p of b.series[period]) {
        const bucket = byDate.get(p.date);
        if (bucket) bucket.push(p.price);
        else byDate.set(p.date, [p.price]);
      }
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([date, prices]) => ({
        date,
        price: Math.round(prices.reduce((s, n) => s + n, 0) / prices.length),
      }));
  };

  const series = {
    week: mergePeriod("week"),
    month: mergePeriod("month"),
    year: mergePeriod("year"),
  };
  const current = Math.round(list.reduce((s, b) => s + b.current, 0) / list.length);
  const average = Math.round(list.reduce((s, b) => s + b.average, 0) / list.length);
  // 여러 시즌 중 가장 최근 조사일을 대표 기준일로 삼는다.
  const asOf = list.reduce((latest, b) => (b.asOf > latest ? b.asOf : latest), head.asOf);
  // 하나라도 더미로 폴백된 시즌이 섞였으면 전체를 폴백으로 표시(보수적).
  const isFallback = list.some((b) => b.isFallback);

  return { ...head, current, average, series, asOf, isFallback };
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

    // 배추·무는 품종이 아니라 계절로 갈린다 → 4개 시즌 코드를 전부 조회해 응답 있는 것만 쓴다
    // (캘린더로 고정하지 않는 게 규격. 지금 살아있는 시즌이 무엇인지 응답이 알려준다).
    const kindCodes = veg.seasonalKindCodes ?? [veg.kindCode];
    const results = await Promise.all(
      kindCodes.map((kindCode) =>
        fetchOneKind(veg, region, kindCode, isoDate(startDate), isoDate(endDate), certKey, certId),
      ),
    );
    const alive = results.filter((r): r is BaselinePrice => r !== null);
    if (alive.length === 0) return getBaselineDummy(vegetableId, region);
    if (alive.length === 1) return alive[0];
    return averageBaselines(alive);
  } catch {
    // 네트워크 실패·타임아웃·파싱 오류 등 — 프로토타입은 항상 동작해야 하므로 더미로 폴백.
    return getBaselineDummy(vegetableId, region);
  }
}
