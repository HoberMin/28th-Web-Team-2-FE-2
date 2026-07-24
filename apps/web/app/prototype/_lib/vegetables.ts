// 야채 catalog + 더미 시세/제보 데이터 (순수 데이터, 서버·클라 공용).
// 실 API 연결 전까지 화면을 채우는 저충실도 더미. KAMIS 매핑값은 실연결 대비 보관.

import type { BaselinePrice, MartPrice, PricePeriod, PricePoint, Report, Vegetable } from "./types";

export const DEFAULT_REGION = "서울";
/** GPS 미허용/키 미수령 시 폴백 자치구 (UT 테스트 장소 = 강남구 선릉). */
export const DEFAULT_DISTRICT = "강남구";

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
 * 시드 제보 데이터 — 크라우드소싱 루프가 처음부터 비지 않게(= 동네 이웃 제보, mine=false).
 * potato/강남구 3건은 Figma "사용자 제보 실제가"와 정합(2000·2380·2290원).
 */
export const SEED_REPORTS: Report[] = [
  { id: "seed-potato-1", vegetableId: "potato", district: "강남구", weightKg: 1, price: 2000, pricePerKg: 2000, createdAt: "2026-07-24T09:00:00+09:00", method: "photo", mine: false },
  { id: "seed-potato-2", vegetableId: "potato", district: "강남구", weightKg: 1, price: 2380, pricePerKg: 2380, createdAt: "2026-07-22T18:20:00+09:00", method: "manual", mine: false },
  { id: "seed-potato-3", vegetableId: "potato", district: "강남구", weightKg: 1, price: 2290, pricePerKg: 2290, createdAt: "2026-07-20T11:05:00+09:00", method: "photo", mine: false },
  { id: "seed-onion-1", vegetableId: "onion", district: "강남구", weightKg: 2, price: 3600, pricePerKg: 1800, createdAt: "2026-07-23T14:30:00+09:00", method: "manual", mine: false },
  { id: "seed-carrot-1", vegetableId: "carrot", district: "강남구", weightKg: 1, price: 2700, pricePerKg: 2700, createdAt: "2026-07-21T10:15:00+09:00", method: "photo", mine: false },
];

/**
 * 내가 올린 제보 시드(mine=true) — 마이페이지 "제보/구매 내역"이 첫 방문에도 비지 않게.
 * 제보=구매 통합 모델이라 이 데이터가 곧 내 구매 기록(시세 대비 소비금액 계산 대상)이다.
 * 동네 크라우드소싱 목록에도 함께 섞여 노출된다(내 제보도 동네 제보의 일부).
 */
export const MY_SEED_REPORTS: Report[] = [
  { id: "mine-potato-1", vegetableId: "potato", district: "강남구", weightKg: 1, price: 2100, pricePerKg: 2100, createdAt: "2026-07-23T19:10:00+09:00", method: "photo", mine: true },
  { id: "mine-tomato-1", vegetableId: "tomato", district: "강남구", weightKg: 1, price: 4800, pricePerKg: 4800, createdAt: "2026-07-19T18:40:00+09:00", method: "manual", mine: true },
  { id: "mine-onion-1", vegetableId: "onion", district: "강남구", weightKg: 2, price: 3400, pricePerKg: 1700, createdAt: "2026-07-15T11:25:00+09:00", method: "photo", mine: true },
  { id: "mine-carrot-1", vegetableId: "carrot", district: "강남구", weightKg: 1, price: 3200, pricePerKg: 3200, createdAt: "2026-07-11T09:30:00+09:00", method: "manual", mine: true },
];

/** 찜 시드 — 첫 방문에도 마이페이지 "찜한 야채"가 비지 않게(vegetableId). */
export const SEED_FAVORITES: string[] = ["potato", "onion"];
