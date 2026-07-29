// 야채 catalog + 더미 시세/제보 데이터 (순수 데이터, 서버·클라 공용).
// 실 API 연결 전까지 화면을 채우는 저충실도 더미. KAMIS 매핑값은 실연결 대비 보관.

import type { BaselinePrice, MartPrice, PricePeriod, PricePoint, Report, Vegetable } from "./types";
import { REGIONS } from "./regions";

export const DEFAULT_REGION = "서울";
/** GPS 미허용/키 미수령 시 폴백 동네(동 단위) — UT 테스트 장소인 강남구 선릉역 인근. */
export const DEFAULT_DISTRICT = "삼성동";

/** 더미 기준일 — Figma 와이어프레임(2026-07-24)과 정합. 실 API 연결 시 대체. */
export const ANCHOR_DATE = "2026-07-24";

/** Figma "인기 야채" 그리드 9종. */
export const VEGETABLES: Vegetable[] = [
  { id: "potato", name: "감자", image: "/veg/potato.svg", emoji: "🥔", category: "식량작물", unit: "1kg", itemCategoryCode: "100", itemCode: "152" },
  { id: "garlic", name: "마늘", image: "/veg/garlic.svg", emoji: "🧄", category: "채소류", unit: "1kg", itemCategoryCode: "200", itemCode: "258" },
  { id: "onion", name: "양파", image: "/veg/onion.svg", emoji: "🧅", category: "채소류", unit: "1kg", itemCategoryCode: "200", itemCode: "245" },
  { id: "sweet-potato", name: "고구마", image: "/veg/sweet-potato.svg", emoji: "🍠", category: "식량작물", unit: "1kg", itemCategoryCode: "100", itemCode: "151" },
  { id: "carrot", name: "당근", image: "/veg/carrot.svg", emoji: "🥕", category: "채소류", unit: "1kg", itemCategoryCode: "200", itemCode: "246" },
  { id: "tomato", name: "토마토", image: "/veg/tomato.svg", emoji: "🍅", category: "채소류", unit: "1kg", itemCategoryCode: "200", itemCode: "225" },
  { id: "corn", name: "옥수수", image: "/veg/corn.svg", emoji: "🌽", category: "식량작물", unit: "1kg", itemCategoryCode: "100", itemCode: "292" },
  { id: "bell-pepper", name: "피망", image: "/veg/bell-pepper.svg", emoji: "🫑", category: "채소류", unit: "1kg", itemCategoryCode: "200", itemCode: "256" },
  { id: "cucumber", name: "오이", image: "/veg/cucumber.svg", emoji: "🥒", category: "채소류", unit: "1kg", itemCategoryCode: "200", itemCode: "223" },
];

/** 품목별 현재 시세 기준값(원). potato는 Figma(2,490원)와 일치. */
const BASE_PRICE: Record<string, number> = {
  potato: 2490,
  garlic: 8900,
  onion: 1980,
  "sweet-potato": 3600,
  carrot: 2900,
  tomato: 5200,
  corn: 1500,
  "bell-pepper": 6900,
  cucumber: 4300,
};

/**
 * 실제 컬리 판매가(원, 1kg 환산) — api.kurly.com 조회 결과, 2026-07-24 기준.
 * price = 실제 컬리 판매가를 1kg로 환산한 값(baseline과 단위 정합). productName = 환산 근거 SKU.
 * 컬리는 프리미엄 온라인 그로서리라 시장/제보가보다 대체로 높다(의도된 포지셔닝 차이).
 * ⚠️ 옥수수·피망·오이는 컬리가 개수(입) 단위로만 팔아 1kg 환산이 불가 → 비교 제외(엔트리 없음).
 * 실 API 연동 시 이 표를 정기 조회 결과로 대체.
 */
const MART_PRICE: Record<string, { price: number; productName: string }> = {
  potato: { price: 4990, productName: "[팜송] 왕감자 1kg" },
  garlic: { price: 12900, productName: "깐마늘 1kg (26년 햇)" },
  // 양파 1.5kg 3,990원 → 1kg 환산 2,660원
  onion: { price: 2660, productName: "양파 1.5kg (1kg 환산)" },
  "sweet-potato": { price: 4990, productName: "한입 꿀고구마 1kg" },
  carrot: { price: 4290, productName: "흙당근 1kg" },
  tomato: { price: 7990, productName: "완숙토마토 1kg" },
};

export function getVegetable(id: string): Vegetable | undefined {
  return VEGETABLES.find((v) => v.id === id);
}

/** 실제 컬리 판매가(1kg 환산). 개수 단위 품목 등 엔트리 없으면 undefined → "컬리 가격" 행 미노출. */
export function getMartPrice(vegetableId: string): MartPrice | undefined {
  const veg = getVegetable(vegetableId);
  const entry = MART_PRICE[vegetableId];
  if (!veg || !entry) return undefined;
  return {
    vegetableId: veg.id,
    mall: "컬리",
    productName: entry.productName,
    unit: veg.unit,
    price: entry.price,
    source: "kurly",
    asOf: ANCHOR_DATE,
  };
}

function round10(n: number): number {
  return Math.round(n / 10) * 10;
}

/** 문자열 → 안정적 seed (Math.random 없이 결정적 더미 생성). */
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return h;
}

function shiftDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${mm}-${dd}`;
}

function shiftMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + months, d));
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${mm}-${dd}`;
}

function buildSeries(base: number, seed: number): Record<PricePeriod, PricePoint[]> {
  const week: PricePoint[] = Array.from({ length: 7 }, (_, i) => ({
    date: shiftDays(ANCHOR_DATE, i - 6),
    price: round10(base * (1 + 0.08 * Math.sin((i + seed) * 0.8))),
  }));
  const month: PricePoint[] = Array.from({ length: 30 }, (_, i) => ({
    date: shiftDays(ANCHOR_DATE, i - 29),
    price: round10(base * (1 + 0.14 * Math.sin((i + seed) * 0.32))),
  }));
  const year: PricePoint[] = Array.from({ length: 12 }, (_, i) => ({
    date: shiftMonths(ANCHOR_DATE, i - 11),
    price: round10(base * (1 + 0.22 * Math.sin((i + seed) * 0.6))),
  }));
  // 현재가(오늘)는 기준값으로 고정 — 모든 기간의 그래프 끝점과 헤더 수치를 맞춘다.
  week[week.length - 1].price = base;
  month[month.length - 1].price = base;
  year[year.length - 1].price = base;
  return { week, month, year };
}

/** 키 미수령 시 화면을 채우는 더미 기준선. KAMIS 응답과 동일한 shape. */
export function getBaselineDummy(vegetableId: string, region: string = DEFAULT_REGION): BaselinePrice {
  const veg = getVegetable(vegetableId) ?? VEGETABLES[0];
  const base = BASE_PRICE[veg.id] ?? 3000;
  const seed = hashSeed(veg.id);
  const series = buildSeries(base, seed);
  const monthAvg = series.month.reduce((sum, p) => sum + p.price, 0) / series.month.length;
  return {
    vegetableId: veg.id,
    region,
    unit: veg.unit,
    current: base,
    average: round10(monthAvg),
    series,
    source: "dummy",
    asOf: ANCHOR_DATE,
  };
}

/**
 * 손으로 작성한 동네 이웃 제보 시드(mine=false).
 * potato/삼성동 3건은 Figma "동네 제보가"와 정합(2000·2380·2290원) — 자동 생성이 덮지 않게 별도 보존.
 */
const HAND_SEED_REPORTS: Report[] = [
  { id: "seed-potato-1", vegetableId: "potato", district: "삼성동", weightKg: 1, price: 2000, pricePerKg: 2000, createdAt: "2026-07-24T09:00:00+09:00", method: "photo", mine: false, purchased: true },
  { id: "seed-potato-2", vegetableId: "potato", district: "삼성동", weightKg: 1, price: 2380, pricePerKg: 2380, createdAt: "2026-07-22T18:20:00+09:00", method: "manual", mine: false, purchased: true },
  { id: "seed-potato-3", vegetableId: "potato", district: "삼성동", weightKg: 1, price: 2290, pricePerKg: 2290, createdAt: "2026-07-20T11:05:00+09:00", method: "photo", mine: false, purchased: true },
  { id: "seed-onion-1", vegetableId: "onion", district: "삼성동", weightKg: 2, price: 3600, pricePerKg: 1800, createdAt: "2026-07-23T14:30:00+09:00", method: "manual", mine: false, purchased: true },
  { id: "seed-carrot-1", vegetableId: "carrot", district: "삼성동", weightKg: 1, price: 2700, pricePerKg: 2700, createdAt: "2026-07-21T10:15:00+09:00", method: "photo", mine: false, purchased: true },
];

/**
 * 내가 올린 제보 시드(mine=true) — 마이페이지 "제보/구매 내역"이 첫 방문에도 비지 않게.
 * "제보 = 관찰한 실제가"이며, purchased=true 인 것만 구매 내역·절약 계산 대상이다.
 * (tomato는 봤지만 비싸서 안 산 케이스 — 제보 내역엔 뜨지만 구매 내역엔 안 잡힘)
 * 동네 크라우드소싱 목록에도 함께 섞여 노출된다(내 제보도 동네 제보의 일부).
 */
export const MY_SEED_REPORTS: Report[] = [
  { id: "mine-potato-1", vegetableId: "potato", district: "삼성동", weightKg: 1, price: 2100, pricePerKg: 2100, createdAt: "2026-07-23T19:10:00+09:00", method: "photo", mine: true, purchased: true },
  { id: "mine-tomato-1", vegetableId: "tomato", district: "삼성동", weightKg: 1, price: 4800, pricePerKg: 4800, createdAt: "2026-07-19T18:40:00+09:00", method: "manual", mine: true, purchased: false },
  { id: "mine-onion-1", vegetableId: "onion", district: "삼성동", weightKg: 2, price: 3400, pricePerKg: 1700, createdAt: "2026-07-15T11:25:00+09:00", method: "photo", mine: true, purchased: true },
  { id: "mine-carrot-1", vegetableId: "carrot", district: "삼성동", weightKg: 1, price: 3200, pricePerKg: 3200, createdAt: "2026-07-11T09:30:00+09:00", method: "manual", mine: true, purchased: true },
];

/**
 * 동네별 이웃 제보 자동 생성 — 어느 동네를 골라도 "동네 제보가"가 비지 않도록
 * 전 동 × 전 품목을 결정적(seed 기반) 더미로 채운다. mine=false(이웃 제보).
 * 이미 수기 시드가 있는 (동네×품목)은 건너뛴다 — 삼성동 감자 등 Figma 정합값 보존.
 */
function generateNeighborhoodReports(): Report[] {
  const authored = new Set(
    [...HAND_SEED_REPORTS, ...MY_SEED_REPORTS].map((r) => `${r.district}|${r.vegetableId}`),
  );
  const reports: Report[] = [];
  for (const region of REGIONS) {
    for (const veg of VEGETABLES) {
      if (authored.has(`${region.label}|${veg.id}`)) continue;
      const base = BASE_PRICE[veg.id] ?? 3000;
      const seed = hashSeed(`${region.id}-${veg.id}`);
      const count = 2 + (seed % 2); // 동네·품목마다 2~3건
      for (let i = 0; i < count; i++) {
        // 기준가 대비 -10~+10% 편차 · 최근 2주 내 날짜 (모두 seed로 결정)
        const price = round10(base * (1 + (((seed + i * 37) % 21) - 10) / 100));
        const daysAgo = (seed + i * 5) % 14;
        reports.push({
          id: `nb-${region.id}-${veg.id}-${i}`,
          vegetableId: veg.id,
          district: region.label,
          weightKg: 1,
          price,
          pricePerKg: price,
          createdAt: `${shiftDays(ANCHOR_DATE, -daysAgo)}T09:00:00+09:00`,
          method: i % 2 === 0 ? "photo" : "manual",
          mine: false,
          purchased: true,
        });
      }
    }
  }
  return reports;
}

/** 동네 크라우드소싱 시드 = 수기 시드(삼성동 Figma 정합) + 전 동네 자동 생성. */
export const SEED_REPORTS: Report[] = [...HAND_SEED_REPORTS, ...generateNeighborhoodReports()];

/** 찜 시드 — 첫 방문에도 마이페이지 "찜한 야채"가 비지 않게(vegetableId). */
export const SEED_FAVORITES: string[] = ["potato", "onion"];
