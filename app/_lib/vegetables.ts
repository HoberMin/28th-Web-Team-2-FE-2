// 야채 catalog(46종) + 더미 시세/제보 데이터 (순수 데이터, 서버·클라 공용).
//
// 카탈로그는 `shared/kamis-vegetable-data-spec.md` v3 규격과 1:1 스냅샷이다. 규격이 진실 소스.
//   단위 정책: kg·g → KAMIS `p_convert_kg_yn=Y` / 개·포기 → `N`(소비자가 그 단위로 사는 품목만)
//   부류코드: 규격상 100(식량작물) 또는 200(채소류) 둘 중 하나로 고정
//   일러스트(SVG)는 Figma에서 받은 10종만 있고 나머지는 이모지 폴백(image 미지정)
// 시세는 실 API 연결 전까지 화면을 채우는 저충실도 더미다.

import type {
  BaselinePrice,
  MarketUnitOption,
  MartPrice,
  OnlineChannelKind,
  OnlineMall,
  PricePeriod,
  PricePoint,
  Report,
  Vegetable,
  VegetableGroup,
} from "./types";
import { REGIONS } from "./regions";

export const DEFAULT_REGION = "서울";
/** GPS 미허용/키 미수령 시 폴백 동네(동 단위) — UT 테스트 장소인 강남구 선릉역 인근. */
export const DEFAULT_DISTRICT = "삼성동";

/**
 * 더미 시세 시리즈·시드 제보의 "오늘" — 예전엔 고정 앵커("2026-07-24")였는데, 실행일이 그
 * 날짜에서 하루씩 멀어질 때마다 모든 시드 제보가 함께 늙어 8일째부터 전 화면이 "오래된 가격"
 * 경고색으로 뒤덮이는 문제가 있었다(백로그 「공통」#3). 이제 항상 실행 시점 기준으로 움직인다.
 * 실 API 연결 시 이 함수 자체가 필요 없어진다(KAMIS 응답의 실제 조사일을 쓰게 됨).
 */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 배추·무의 계절 품종코드 — 봄/여름고랭지/가을/월동 4개를 매번 전부 조회해
 * **응답이 있는 것만** 평균하는 게 규격(캘린더로 고정하지 않는다).
 * TODO(✍️): 4개 각각의 실제 kindCode 값이 규격 문서에 없어 확인 필요. 지금은 01~04로 조회 시도.
 */
const SEASONAL_KIND_CODES = ["01", "02", "03", "04"];

/** 유저 노출 46종 (규격 §품목 스코프). */
export const VEGETABLES: Vegetable[] = [
  // ── 식량작물(100) ─────────────────────────────────────────────
  { id: "potato", name: "감자", image: "/veg/potato.svg", emoji: "🥔", category: "식량작물", unit: "1kg", unitType: "kg", itemCategoryCode: "100", itemCode: "152", kindCode: "01", kindLabel: "수미·노지" },
  { id: "sweet-potato", name: "고구마", image: "/veg/sweet-potato.svg", emoji: "🍠", category: "식량작물", unit: "1kg", unitType: "kg", itemCategoryCode: "100", itemCode: "151", kindCode: "00", kindLabel: "밤고구마" },

  // ── 뿌리·양념 채소 ────────────────────────────────────────────
  { id: "garlic", name: "마늘", image: "/veg/garlic.svg", emoji: "🧄", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "258", kindCode: "01", kindLabel: "깐마늘 국산" },
  { id: "onion", name: "양파", image: "/veg/onion.svg", emoji: "🧅", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "245", kindCode: "00" },
  { id: "carrot", name: "당근", image: "/veg/carrot.svg", emoji: "🥕", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "232", kindCode: "01", kindLabel: "무세척" },
  { id: "ginger", name: "생강", emoji: "🫚", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "247", kindCode: "00", kindLabel: "국산" },

  // ── 열매 채소 ─────────────────────────────────────────────────
  { id: "tomato", name: "토마토", image: "/veg/tomato.svg", emoji: "🍅", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "225", kindCode: "00" },
  { id: "cherry-tomato", name: "방울토마토", emoji: "🍅", category: "채소류", unit: "1개", unitType: "개", itemCategoryCode: "200", itemCode: "422", kindCode: "01" },
  { id: "date-cherry-tomato", name: "대추방울토마토", emoji: "🍅", category: "채소류", unit: "1개", unitType: "개", itemCategoryCode: "200", itemCode: "422", kindCode: "02" },
  { id: "bell-pepper", name: "피망", image: "/veg/bell-pepper.svg", emoji: "🫑", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "255", kindCode: "00", kindLabel: "청" },
  { id: "paprika", name: "파프리카", emoji: "🫑", category: "채소류", unit: "100g", unitType: "g", itemCategoryCode: "200", itemCode: "256", kindCode: "00" },
  { id: "cucumber", name: "오이", image: "/veg/cucumber.svg", emoji: "🥒", category: "채소류", unit: "1개", unitType: "개", itemCategoryCode: "200", itemCode: "223", kindCode: "02", kindLabel: "다다기계통" },
  { id: "zucchini-korean", name: "애호박", emoji: "🥒", category: "채소류", unit: "1개", unitType: "개", itemCategoryCode: "200", itemCode: "224", kindCode: "01" },
  { id: "zucchini", name: "쥬키니", emoji: "🥒", category: "채소류", unit: "1개", unitType: "개", itemCategoryCode: "200", itemCode: "224", kindCode: "02" },

  // ── 고추류 ────────────────────────────────────────────────────
  { id: "green-pepper", name: "풋고추", emoji: "🌶️", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "242", kindCode: "00", kindLabel: "녹광 등" },
  { id: "kkwari-pepper", name: "꽈리고추", emoji: "🌶️", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "242", kindCode: "02" },
  { id: "cheongyang-pepper", name: "청양고추", emoji: "🌶️", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "242", kindCode: "03" },
  { id: "mild-pepper", name: "오이맛고추", emoji: "🌶️", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "242", kindCode: "04" },
  { id: "red-pepper", name: "붉은고추", image: "/veg/red-pepper.svg", emoji: "🌶️", category: "채소류", unit: "100g", unitType: "g", itemCategoryCode: "200", itemCode: "243", kindCode: "00" },
  { id: "dried-pepper", name: "건고추", emoji: "🌶️", category: "채소류", unit: "100g", unitType: "g", itemCategoryCode: "200", itemCode: "241", kindCode: "00", kindLabel: "화건" },
  { id: "pepper-powder-kr", name: "고춧가루(국산)", emoji: "🫙", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "248", kindCode: "00" },
  { id: "pepper-powder-cn", name: "고춧가루(중국산)", emoji: "🫙", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "248", kindCode: "01" },

  // ── 배추·무 계열 ──────────────────────────────────────────────
  { id: "napa-cabbage", name: "배추", emoji: "🥬", category: "채소류", unit: "1포기", unitType: "포기", itemCategoryCode: "200", itemCode: "211", kindCode: "00", kindLabel: "계절형(봄·여름고랭지·가을·월동)", seasonalKindCodes: SEASONAL_KIND_CODES },
  { id: "radish", name: "무", emoji: "🥬", category: "채소류", unit: "1개", unitType: "개", itemCategoryCode: "200", itemCode: "231", kindCode: "00", kindLabel: "계절형(봄·고랭지·가을·월동)", seasonalKindCodes: SEASONAL_KIND_CODES },
  { id: "baby-napa-cabbage", name: "알배기배추", emoji: "🥬", category: "채소류", unit: "1포기", unitType: "포기", itemCategoryCode: "200", itemCode: "279", kindCode: "00" },
  { id: "young-napa-cabbage", name: "얼갈이배추", emoji: "🥬", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "215", kindCode: "00" },
  { id: "cabbage", name: "양배추", emoji: "🥬", category: "채소류", unit: "1포기", unitType: "포기", itemCategoryCode: "200", itemCode: "212", kindCode: "00" },
  { id: "young-radish", name: "열무", emoji: "🥬", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "233", kindCode: "00" },

  // ── 잎채소 ────────────────────────────────────────────────────
  { id: "spinach", name: "시금치", emoji: "🥬", category: "채소류", unit: "100g", unitType: "g", itemCategoryCode: "200", itemCode: "213", kindCode: "00" },
  { id: "red-lettuce", name: "적상추", emoji: "🥬", category: "채소류", unit: "100g", unitType: "g", itemCategoryCode: "200", itemCode: "214", kindCode: "01" },
  { id: "green-lettuce", name: "청상추", emoji: "🥬", category: "채소류", unit: "100g", unitType: "g", itemCategoryCode: "200", itemCode: "214", kindCode: "02" },
  { id: "perilla-leaf", name: "깻잎", emoji: "🌿", category: "채소류", unit: "100g", unitType: "g", itemCategoryCode: "200", itemCode: "253", kindCode: "00" },
  { id: "water-parsley", name: "미나리", emoji: "🌿", category: "채소류", unit: "100g", unitType: "g", itemCategoryCode: "200", itemCode: "252", kindCode: "00" },
  { id: "welsh-onion", name: "대파", emoji: "🌱", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "246", kindCode: "00" },
  { id: "chive", name: "쪽파", emoji: "🌱", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "246", kindCode: "02" },
  { id: "broccoli", name: "브로콜리", image: "/veg/broccoli.svg", emoji: "🥦", category: "채소류", unit: "1개", unitType: "개", itemCategoryCode: "200", itemCode: "280", kindCode: "00" },
  { id: "mustard-green", name: "갓", emoji: "🥬", category: "채소류", unit: "1kg", unitType: "kg", itemCategoryCode: "200", itemCode: "216", kindCode: "00", season: { months: [11, 12], label: "가을~겨울 한정" } },

  // ── 버섯 ──────────────────────────────────────────────────────
  { id: "oyster-mushroom", name: "느타리버섯", emoji: "🍄", category: "채소류", unit: "100g", unitType: "g", itemCategoryCode: "200", itemCode: "315", kindCode: "00" },
  { id: "enoki-mushroom", name: "팽이버섯", emoji: "🍄", category: "채소류", unit: "100g", unitType: "g", itemCategoryCode: "200", itemCode: "316", kindCode: "00" },
  { id: "king-oyster-mushroom", name: "새송이버섯", emoji: "🍄", category: "채소류", unit: "100g", unitType: "g", itemCategoryCode: "200", itemCode: "317", kindCode: "00" },

  // ── 특용작물 ──────────────────────────────────────────────────
  { id: "sesame", name: "참깨", emoji: "🌾", category: "채소류", unit: "100g", unitType: "g", itemCategoryCode: "200", itemCode: "312", kindCode: "01", kindLabel: "국산" },
  { id: "peanut", name: "땅콩", emoji: "🥜", category: "채소류", unit: "100g", unitType: "g", itemCategoryCode: "200", itemCode: "314", kindCode: "01", kindLabel: "국산" },

  // ── KAMIS가 채소류로 분류하는 과채류(규격 §스코프) ───────────
  { id: "watermelon", name: "수박", emoji: "🍉", category: "과일", unit: "1개", unitType: "개", itemCategoryCode: "200", itemCode: "221", kindCode: "00", season: { months: [5, 6, 7, 8, 9], label: "여름 한정" } },
  { id: "korean-melon", name: "참외", emoji: "🍈", category: "과일", unit: "1개", unitType: "개", itemCategoryCode: "200", itemCode: "222", kindCode: "00", season: { months: [3, 4, 5, 6, 7, 8], label: "봄~여름 한정" } },
  { id: "melon", name: "멜론", emoji: "🍈", category: "과일", unit: "1개", unitType: "개", itemCategoryCode: "200", itemCode: "257", kindCode: "00" },
  { id: "strawberry", name: "딸기", emoji: "🍓", category: "과일", unit: "100g", unitType: "g", itemCategoryCode: "200", itemCode: "226", kindCode: "00", season: { months: [12, 1, 2, 3, 4, 5], label: "겨울~봄 한정" } },
];

/**
 * 화면 필터용 그룹 — 46종을 3열 그리드에 그대로 쏟으면 16줄이 되어 홈이 스크롤에 잠긴다.
 * 부류코드(100/200)는 값이 2개뿐이라 필터가 안 되므로 "장 볼 때 묶는 방식"으로 따로 나눈다.
 * id → 그룹 맵으로 둬서 카탈로그 46줄을 건드리지 않는다.
 */
const GROUP_BY_ID: Record<string, VegetableGroup> = {
  potato: "뿌리채소",
  "sweet-potato": "뿌리채소",
  carrot: "뿌리채소",
  radish: "뿌리채소",
  ginger: "뿌리채소",

  garlic: "마늘·파·생강",
  onion: "마늘·파·생강",
  "welsh-onion": "마늘·파·생강",
  chive: "마늘·파·생강",
  "pepper-powder-kr": "마늘·파·생강",
  "pepper-powder-cn": "마늘·파·생강",
  "dried-pepper": "마늘·파·생강",
  "red-pepper": "마늘·파·생강",
  sesame: "마늘·파·생강",
  peanut: "마늘·파·생강",

  "green-pepper": "고추류",
  "kkwari-pepper": "고추류",
  "cheongyang-pepper": "고추류",
  "mild-pepper": "고추류",

  "napa-cabbage": "잎채소",
  "baby-napa-cabbage": "잎채소",
  "young-napa-cabbage": "잎채소",
  cabbage: "잎채소",
  "young-radish": "잎채소",
  spinach: "잎채소",
  "red-lettuce": "잎채소",
  "green-lettuce": "잎채소",
  "perilla-leaf": "잎채소",
  "water-parsley": "잎채소",
  "mustard-green": "잎채소",
  broccoli: "잎채소",

  tomato: "열매채소",
  "cherry-tomato": "열매채소",
  "date-cherry-tomato": "열매채소",
  "bell-pepper": "열매채소",
  paprika: "열매채소",
  cucumber: "열매채소",
  "zucchini-korean": "열매채소",
  zucchini: "열매채소",

  "oyster-mushroom": "버섯류",
  "enoki-mushroom": "버섯류",
  "king-oyster-mushroom": "버섯류",

  watermelon: "과일류",
  "korean-melon": "과일류",
  melon: "과일류",
  strawberry: "과일류",
};

/** 필터 칩 노출 순서 — 자주 사는 것부터. */
export const VEGETABLE_GROUPS: VegetableGroup[] = [
  "뿌리채소",
  "잎채소",
  "열매채소",
  "고추류",
  "마늘·파·생강",
  "버섯류",
  "과일류",
];

export function getVegetableGroup(id: string): VegetableGroup {
  return GROUP_BY_ID[id] ?? "잎채소";
}

/** 홈 "인기 야채" 상단 고정 — 일러스트가 있어 그리드에서 가장 잘 읽히는 8종. */
export const POPULAR_IDS: string[] = [
  "potato",
  "onion",
  "garlic",
  "sweet-potato",
  "carrot",
  "tomato",
  "cucumber",
  "bell-pepper",
];

/**
 * 품목별 현재 시세 기준값(원) — **각 품목의 `unit` 단위 기준**.
 * potato는 Figma(2,490원/1kg)와 일치. 나머지는 소매 상식 수준의 저충실도 더미.
 */
const BASE_PRICE: Record<string, number> = {
  potato: 2490,
  "sweet-potato": 3600,
  garlic: 8900,
  onion: 1980,
  carrot: 2900,
  ginger: 9800,
  tomato: 5200,
  "cherry-tomato": 400,
  "date-cherry-tomato": 500,
  "bell-pepper": 6900,
  paprika: 1200,
  cucumber: 1100,
  "zucchini-korean": 1800,
  zucchini: 1600,
  "green-pepper": 9800,
  "kkwari-pepper": 11000,
  "cheongyang-pepper": 12500,
  "mild-pepper": 9500,
  "red-pepper": 1500,
  "dried-pepper": 3800,
  "pepper-powder-kr": 32000,
  "pepper-powder-cn": 14000,
  "napa-cabbage": 5500,
  radish: 2200,
  "baby-napa-cabbage": 3200,
  "young-napa-cabbage": 3500,
  cabbage: 4300,
  "young-radish": 3800,
  spinach: 900,
  "red-lettuce": 1100,
  "green-lettuce": 1000,
  "perilla-leaf": 1900,
  "water-parsley": 1300,
  "welsh-onion": 3400,
  chive: 6800,
  broccoli: 2900,
  "mustard-green": 4200,
  "oyster-mushroom": 800,
  "enoki-mushroom": 500,
  "king-oyster-mushroom": 900,
  sesame: 3200,
  peanut: 2100,
  watermelon: 18000,
  "korean-melon": 3500,
  melon: 9800,
  strawberry: 2400,
};

/**
 * 온라인 판매가 스냅샷 — 컬리는 실측(api.kurly.com, 2026-07-24), **오아시스·GS SHOP·11번가는 더미**다.
 * ⚠️ 크롤링 미연결 상태라 실측이 아닌 값은 화면에서 "예시"로 밝힌다.
 *
 * 채널 성격을 반드시 함께 담는다(types §OnlineChannelKind):
 *   컬리 = 새벽배송·프리미엄 → 대체로 비쌈(의도된 포지셔닝)
 *   오아시스 = 새벽배송·회원가 전제
 *   GS SHOP·11번가 = 오픈마켓·판매자 편차 큼·배송비 별도
 * 기준 단위 환산이 불가한 SKU는 엔트리를 두지 않는다(억지 환산이 더 위험하다).
 */
interface MallEntry {
  mall: OnlineMall;
  price: number;
  productName: string;
  channel: OnlineChannelKind;
  channelNote?: string;
  /** 실제 조회값인지(컬리만 true) — 화면에서 "예시" 라벨 여부를 가른다 */
  measured?: boolean;
}

const ONLINE_PRICES: Record<string, MallEntry[]> = {
  potato: [
    { mall: "컬리", price: 4990, productName: "[팜송] 왕감자 1kg", channel: "새벽배송", measured: true },
    { mall: "오아시스", price: 3680, productName: "감자 2kg (1kg 환산)", channel: "새벽배송", channelNote: "회원가" },
    { mall: "GS SHOP", price: 3200, productName: "포슬포슬 감자 5kg (1kg 환산)", channel: "오픈마켓", channelNote: "배송비 별도" },
    { mall: "11번가", price: 5400, productName: "감자 1kg", channel: "오픈마켓", channelNote: "배송비 별도" },
  ],
  onion: [
    { mall: "컬리", price: 2660, productName: "양파 1.5kg (1kg 환산)", channel: "새벽배송", measured: true },
    { mall: "오아시스", price: 2290, productName: "양파 3kg (1kg 환산)", channel: "새벽배송", channelNote: "회원가" },
    { mall: "GS SHOP", price: 1890, productName: "국내산 양파 10kg (1kg 환산)", channel: "오픈마켓", channelNote: "배송비 별도" },
    { mall: "11번가", price: 3200, productName: "양파 1kg", channel: "오픈마켓", channelNote: "배송비 별도" },
  ],
  garlic: [
    { mall: "컬리", price: 12900, productName: "깐마늘 1kg (26년 햇)", channel: "새벽배송", measured: true },
    { mall: "오아시스", price: 11900, productName: "깐마늘 1kg", channel: "새벽배송", channelNote: "회원가" },
    { mall: "GS SHOP", price: 9800, productName: "깐마늘 2kg (1kg 환산)", channel: "오픈마켓", channelNote: "배송비 별도" },
  ],
  "sweet-potato": [
    { mall: "컬리", price: 4990, productName: "한입 꿀고구마 1kg", channel: "새벽배송", measured: true },
    { mall: "오아시스", price: 4180, productName: "꿀고구마 2kg (1kg 환산)", channel: "새벽배송", channelNote: "회원가" },
    { mall: "GS SHOP", price: 3490, productName: "베니하루카 5kg (1kg 환산)", channel: "오픈마켓", channelNote: "배송비 별도" },
  ],
  carrot: [
    { mall: "컬리", price: 4290, productName: "흙당근 1kg", channel: "새벽배송", measured: true },
    { mall: "오아시스", price: 3480, productName: "당근 1kg", channel: "새벽배송", channelNote: "회원가" },
    { mall: "11번가", price: 4600, productName: "당근 1kg", channel: "오픈마켓", channelNote: "배송비 별도" },
  ],
  tomato: [
    { mall: "컬리", price: 7990, productName: "완숙토마토 1kg", channel: "새벽배송", measured: true },
    { mall: "오아시스", price: 6980, productName: "완숙토마토 1kg", channel: "새벽배송", channelNote: "회원가" },
    { mall: "11번가", price: 8400, productName: "완숙토마토 700g (1kg 환산)", channel: "오픈마켓", channelNote: "배송비 별도" },
  ],
  paprika: [
    { mall: "컬리", price: 1690, productName: "파프리카 2입 (100g 환산)", channel: "새벽배송", measured: true },
    { mall: "오아시스", price: 1380, productName: "파프리카 1kg (100g 환산)", channel: "새벽배송", channelNote: "회원가" },
  ],
  spinach: [
    { mall: "컬리", price: 1490, productName: "시금치 200g (100g 환산)", channel: "새벽배송", measured: true },
    { mall: "11번가", price: 1900, productName: "시금치 200g (100g 환산)", channel: "오픈마켓", channelNote: "배송비 별도" },
  ],
  "welsh-onion": [
    { mall: "컬리", price: 4290, productName: "손질대파 1kg", channel: "새벽배송", measured: true },
    { mall: "오아시스", price: 3690, productName: "손질대파 1kg", channel: "새벽배송", channelNote: "회원가" },
    { mall: "GS SHOP", price: 2980, productName: "흙대파 3kg (1kg 환산)", channel: "오픈마켓", channelNote: "배송비 별도" },
  ],
  broccoli: [
    { mall: "컬리", price: 3290, productName: "브로콜리 1개", channel: "새벽배송", measured: true },
    { mall: "오아시스", price: 2680, productName: "브로콜리 2입 (1개 환산)", channel: "새벽배송", channelNote: "회원가" },
  ],
  cabbage: [
    { mall: "컬리", price: 5490, productName: "양배추 1포기", channel: "새벽배송", measured: true },
    { mall: "오아시스", price: 4680, productName: "양배추 1포기", channel: "새벽배송", channelNote: "회원가" },
    { mall: "11번가", price: 5900, productName: "양배추 1/2포기 (1포기 환산)", channel: "오픈마켓", channelNote: "배송비 별도" },
  ],
  "enoki-mushroom": [
    { mall: "컬리", price: 690, productName: "팽이버섯 300g (100g 환산)", channel: "새벽배송", measured: true },
    { mall: "오아시스", price: 530, productName: "팽이버섯 5봉 (100g 환산)", channel: "새벽배송", channelNote: "회원가" },
  ],
  strawberry: [
    { mall: "컬리", price: 3990, productName: "설향 딸기 500g (100g 환산)", channel: "새벽배송", measured: true },
    { mall: "오아시스", price: 3480, productName: "설향 딸기 750g (100g 환산)", channel: "새벽배송", channelNote: "회원가" },
  ],
};

/**
 * `ONLINE_PRICES`에 수기 엔트리가 없는 나머지 품목(30여 종)을 채우는 폴백 —
 * 온라인 섹션이 "있다 없다" 하면 디자이너가 규격을 하나로 못 잡는다(백로그 F03 #11).
 * 컬리·오아시스·GS SHOP·11번가 4개 채널을 `BASE_PRICE` 대비 배율로 합성한다(전부 더미 — measured: false).
 */
const FALLBACK_MALL_PROFILE: { mall: OnlineMall; channel: OnlineChannelKind; mult: number; note?: string }[] = [
  { mall: "컬리", channel: "새벽배송", mult: 1.2 },
  { mall: "오아시스", channel: "새벽배송", mult: 1.0, note: "회원가" },
  { mall: "GS SHOP", channel: "오픈마켓", mult: 0.82, note: "배송비 별도" },
  { mall: "11번가", channel: "오픈마켓", mult: 1.35, note: "배송비 별도" },
];

function buildFallbackOnlineEntries(veg: Vegetable, base: number): MallEntry[] {
  return FALLBACK_MALL_PROFILE.map(({ mall, channel, mult, note }) => ({
    mall,
    price: round10(base * mult),
    productName: `${veg.name} ${veg.unit} (예시)`,
    channel,
    channelNote: note,
    measured: false,
  }));
}

export function getVegetable(id: string): Vegetable | undefined {
  return VEGETABLES.find((v) => v.id === id);
}

/**
 * 이 품목이 지금 달에 조사되는지(제철인지).
 * `season` 없는 품목은 연중 조사되므로 항상 true.
 */
export function isInSeason(veg: Vegetable, month: number): boolean {
  if (!veg.season) return true;
  return veg.season.months.includes(month);
}

/**
 * 시장에서 실제로 파는 단위 목록 — 기준 단위(veg.unit) 환산비를 함께 준다.
 * 시장은 "감자 1망 5,000원"처럼 팔기 때문에, kg 시세와 비교하려면 이 환산이 먼저다.
 * 첫 항목이 기준 단위(ratio 1) — 폼의 기본 선택값.
 */
export function getMarketUnitOptions(veg: Vegetable): MarketUnitOption[] {
  switch (veg.unitType) {
    case "kg":
      return [
        { label: "1kg", ratio: 1 },
        { label: "1단", ratio: 0.8, note: "대파·쪽파 등 단 묶음 평균 800g" },
        { label: "1망", ratio: 1.5, note: "감자·양파 망 평균 1.5kg" },
        { label: "1박스", ratio: 5, note: "소매 박스 평균 5kg" },
      ];
    case "g":
      return [
        { label: "100g", ratio: 1 },
        { label: "1봉지(200g)", ratio: 2 },
        { label: "1단(300g)", ratio: 3, note: "시금치·미나리 등 단 묶음" },
        { label: "500g", ratio: 5 },
      ];
    case "개":
      return [
        { label: "1개", ratio: 1 },
        { label: "3개 묶음", ratio: 3 },
        { label: "1봉지(5개)", ratio: 5 },
      ];
    case "포기":
      return [
        { label: "1포기", ratio: 1 },
        { label: "2포기", ratio: 2 },
        { label: "3포기", ratio: 3 },
      ];
  }
}

export interface OnlinePriceSet {
  /** 싼 순으로 정렬된 채널별 가격 */
  prices: MartPrice[];
  /** 가장 싼 채널 */
  cheapest: MartPrice;
  /** 실측이 아닌(더미) 값이 섞여 있는지 — 화면에서 "예시" 라벨을 붙일 근거 */
  hasEstimated: boolean;
}

/**
 * 품목의 온라인 판매가 묶음(기준 단위 환산). 수기 엔트리에 없는 채널은
 * `buildFallbackOnlineEntries`로 채워 **전 품목 × 4채널**에 섹션이 뜨게 한다
 * (백로그 F03 #11 — 품목마다 있다 없다 하면 규격이 안 잡힌다).
 * 온라인은 여전히 보조 기준이라 화면 위계는 올리지 않는다.
 *
 * `anchorPrice`(라이브 오늘 공공시세, 있으면)를 넘기면 **추정(`measured` 아닌)** 항목들을
 * 거기에 비례해서 다시 계산한다 — 그대로 두면 `ONLINE_PRICES`에 박힌 고정값이 라이브
 * 공공시세와 완전히 동떨어져 보인다(예: 감자 공공시세가 1,300원인데 "예시" 온라인가가
 * 7월 말 시세 기준 4,990~5,400원으로 박혀 있으면 앞뒤가 안 맞는다 — 사용자 지적,
 * 2026-08-21). 배율은 `BASE_PRICE` 대비로 역산해서 채널별 위계(컬리 프리미엄·GS SHOP
 * 저가 등)는 그대로 지킨다. **실측(`measured: true`)은 건드리지 않는다** — 실제로 관측한
 * 값이라 "그때 그 가격"이 의미가 있고, 지금 시세로 다시 계산하면 오히려 거짓이 된다.
 */
export function getOnlinePrices(
  vegetableId: string,
  anchorPrice?: number | null,
): OnlinePriceSet | undefined {
  const veg = getVegetable(vegetableId);
  if (!veg) return undefined;
  const calibratedBase = BASE_PRICE[vegetableId] ?? 3000;
  const authored = (ONLINE_PRICES[vegetableId] ?? []).map((entry) =>
    entry.measured || typeof anchorPrice !== "number" || anchorPrice <= 0
      ? entry
      : { ...entry, price: round10(entry.price * (anchorPrice / calibratedBase)) },
  );
  const authoredMalls = new Set(authored.map((entry) => entry.mall));
  const fallbackBase = typeof anchorPrice === "number" && anchorPrice > 0 ? anchorPrice : calibratedBase;
  const entries = [
    ...authored,
    ...buildFallbackOnlineEntries(veg, fallbackBase).filter(
      (entry) => !authoredMalls.has(entry.mall),
    ),
  ];
  if (entries.length === 0) return undefined;

  const prices: MartPrice[] = entries
    .map((e) => ({
      vegetableId: veg.id,
      mall: e.mall,
      productName: e.productName,
      unit: veg.unit,
      price: e.price,
      channel: e.channel,
      channelNote: e.channelNote,
      asOf: todayIso(),
      measured: e.measured ?? false,
    }))
    .sort((a, b) => a.price - b.price);

  return {
    prices,
    cheapest: prices[0],
    hasEstimated: entries.some((e) => !e.measured),
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

function buildSeries(base: number, seed: number, anchor: string): Record<PricePeriod, PricePoint[]> {
  const week: PricePoint[] = Array.from({ length: 7 }, (_, i) => ({
    date: shiftDays(anchor, i - 6),
    price: round10(base * (1 + 0.08 * Math.sin((i + seed) * 0.8))),
  }));
  const month: PricePoint[] = Array.from({ length: 30 }, (_, i) => ({
    date: shiftDays(anchor, i - 29),
    price: round10(base * (1 + 0.14 * Math.sin((i + seed) * 0.32))),
  }));
  const year: PricePoint[] = Array.from({ length: 12 }, (_, i) => ({
    date: shiftMonths(anchor, i - 11),
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
  // 한 번만 계산해 시리즈 끝점(오늘)과 asOf가 같은 날을 가리키게 한다(둘을 따로 new Date()하면
  // 자정 근처에서 하루 어긋날 수 있음).
  const anchor = todayIso();
  const series = buildSeries(base, seed, anchor);
  const monthAvg = series.month.reduce((sum, p) => sum + p.price, 0) / series.month.length;
  return {
    vegetableId: veg.id,
    region,
    unit: veg.unit,
    current: base,
    average: round10(monthAvg),
    series,
    source: "dummy",
    // 진짜/더미 구분(isFallback)과 짝을 맞춰 "오늘 기준 값처럼 보이되 실데이터가 아님"을 드러낸다.
    asOf: anchor,
    isFallback: true,
  };
}

/**
 * N일 전 "YYYY-MM-DDTHH:mm:ss+09:00" — 오늘(`todayIso`) 기준 상대 시각.
 * 시드의 절대 날짜를 고정하지 않고 "오늘로부터 며칠 전"만 고정해, 실행일이 바뀌어도
 * 신선도(오늘/어제/N일 전 · 8일 초과 시 "오래된 가격")가 항상 같은 상태로 유지되게 한다.
 */
function daysAgoAt(days: number, time: string): string {
  return `${shiftDays(todayIso(), -days)}T${time}+09:00`;
}

/**
 * 시드(수기·자동 생성 이웃 제보)를 부여하는 동 — **이 목록 밖의 동네는 항상 빈 배열**이라
 * 「제보 없는 동네」 빈 상태(랭킹·가게·가게 상세·댓글)에 실제로 도달할 수 있다(백로그 「공통」#4).
 * 동네를 바꿔가며 빈 상태를 보고 싶으면 이 배열에 없는 동(예: 대부분의 다른 구)으로 전환하면 된다.
 */
export const SEED_DISTRICTS: string[] = [
  "삼성동", // 기본 동네(DEFAULT_DISTRICT) — 수기 시드(Figma 정합값) 보유
  "역삼1동",
  "대치1동",
  "서초2동",
  "잠실3동",
  "서교동", // 홍대
  "여의동",
  "신촌동",
];

/** 자동 생성 이웃 제보에 붙일 닉네임 풀 — 결정적으로 골라 같은 조건이면 항상 같은 이름이 나오게(본명 아님). */
const NEIGHBOR_NICKNAME_POOL = [
  "선릉이웃",
  "알뜰장보기",
  "동네한바퀴",
  "세아이엄마",
  "장바구니요정",
  "냉장고파먹기",
  "매일저녁찬거리",
  "주말장보기",
];

/**
 * 손으로 작성한 동네 이웃 제보 시드(mine=false).
 * potato/삼성동 첫 3건은 Figma "동네 제보가"와 정합(2000·2380·2290원), 나머지 2건은
 * 더보기 바텀시트 검증용이다 — 자동 생성이 덮지 않게 별도 보존.
 * place는 가게 축(F09 가게 상세)이 비지 않도록 삼성동 실제 상권 이름으로 채운다.
 * 함수인 이유: createdAt이 `daysAgoAt`(오늘 기준 상대값)이라 호출 시점마다 다시 계산해야 한다.
 */
function buildHandSeedReports(): Report[] {
  return [
    { id: "seed-potato-1", vegetableId: "potato", district: "삼성동", place: "우리농산물가락직판장", weightKg: 1, price: 2000, pricePerKg: 2000, createdAt: daysAgoAt(0, "09:00:00"), method: "photo", mine: false, purchased: true, nickname: "선릉이웃" },
    { id: "seed-potato-2", vegetableId: "potato", district: "삼성동", place: "행복청과", weightKg: 1, price: 2380, pricePerKg: 2380, createdAt: daysAgoAt(2, "18:20:00"), method: "manual", mine: false, purchased: true, nickname: "알뜰장보기" },
    { id: "seed-potato-3", vegetableId: "potato", district: "삼성동", place: "이마트 강남점", weightKg: 1, price: 2290, pricePerKg: 2290, createdAt: daysAgoAt(4, "11:05:00"), method: "photo", mine: false, purchased: true, nickname: "동네한바퀴" },
    { id: "seed-potato-4", vegetableId: "potato", district: "삼성동", place: "제일마트", weightKg: 1, price: 2150, pricePerKg: 2150, createdAt: daysAgoAt(6, "16:40:00"), method: "manual", mine: false, purchased: true, nickname: "냉장고파먹기" },
    { id: "seed-potato-5", vegetableId: "potato", district: "삼성동", place: "선릉시장 3번가게", weightKg: 1, price: 2450, pricePerKg: 2450, createdAt: daysAgoAt(8, "12:10:00"), method: "photo", mine: false, purchased: true, nickname: "주말장보기" },
    { id: "seed-onion-1", vegetableId: "onion", district: "삼성동", place: "우리농산물가락직판장", weightKg: 2, price: 3600, pricePerKg: 1800, createdAt: daysAgoAt(1, "14:30:00"), method: "manual", mine: false, purchased: true, nickname: "세아이엄마" },
    { id: "seed-carrot-1", vegetableId: "carrot", district: "삼성동", place: "행복청과", weightKg: 1, price: 2700, pricePerKg: 2700, createdAt: daysAgoAt(3, "10:15:00"), method: "photo", mine: false, purchased: true, nickname: "장바구니요정" },
  ];
}

/**
 * 내가 올린 제보 시드(mine=true) — 마이페이지 "제보/구매 내역"이 첫 방문에도 비지 않게.
 * "제보 = 관찰한 실제가"이며, purchased=true 인 것만 구매 내역·절약 계산 대상이다.
 * (tomato는 봤지만 비싸서 안 산 케이스 — 제보 내역엔 뜨지만 구매 내역엔 안 잡힘)
 *
 * nickname은 자리표시자("나")일 뿐이다 — 실제 표시 닉네임은 `reports-store.ts`가 읽기 시점에
 * **현재 온보딩 닉네임**으로 항상 덮어쓴다(mine=true 전부 동일 규칙).
 *
 * ⚠️ mine-onion-1(9일 전)·mine-carrot-1(13일 전)은 **의도적으로 8일 초과(오래된 가격)로 남겨둔다** —
 * 이 상태에 도달할 방법이 아예 없으면 디자이너가 "오래된 가격이에요" 화면을 검증할 수 없다.
 * 함수인 이유는 `buildHandSeedReports`와 동일(상대 날짜 재계산).
 */
function buildMySeedReports(): Report[] {
  return [
    { id: "mine-potato-1", vegetableId: "potato", district: "삼성동", place: "우리농산물가락직판장", weightKg: 1, price: 2100, pricePerKg: 2100, createdAt: daysAgoAt(1, "19:10:00"), method: "photo", mine: true, purchased: true, nickname: "나" },
    { id: "mine-tomato-1", vegetableId: "tomato", district: "삼성동", place: "이마트 강남점", weightKg: 1, price: 4800, pricePerKg: 4800, createdAt: daysAgoAt(5, "18:40:00"), method: "manual", mine: true, purchased: false, nickname: "나" },
    { id: "mine-onion-1", vegetableId: "onion", district: "삼성동", place: "행복청과", weightKg: 2, price: 3400, pricePerKg: 1700, createdAt: daysAgoAt(9, "11:25:00"), method: "photo", mine: true, purchased: true, nickname: "나" },
    { id: "mine-carrot-1", vegetableId: "carrot", district: "삼성동", place: "우리농산물가락직판장", weightKg: 1, price: 3200, pricePerKg: 3200, createdAt: daysAgoAt(13, "09:30:00"), method: "manual", mine: true, purchased: true, nickname: "나" },
  ];
}

/** 마이페이지 "제보/구매 내역" 등이 쓰는 내 제보 시드. 항상 새로 계산해 상대 날짜를 유지한다. */
export function getMySeedReports(): Report[] {
  return buildMySeedReports();
}

/**
 * 자동 생성 제보에 붙일 가게명 풀 — 동네별로 결정적으로 골라 가게 축(F09)이 항상 채워지게.
 * `comments-store.ts`가 "시드 댓글을 붙일 가게"를 판단할 때도 같이 참조한다(export 필요 이유).
 */
export const STORE_NAME_POOL = ["행복청과", "동네야채가게", "제일마트", "선릉시장 3번가게", "농협하나로마트"];

/** 수기 시드(`buildHandSeedReports`)가 쓰는 삼성동 가게명 — 댓글 시드 대상 판단에도 재사용. */
export const HAND_SEED_STORE_NAMES = ["우리농산물가락직판장", "행복청과", "이마트 강남점"];

/**
 * 한 동네의 이웃 제보를 결정적으로 생성한다(mine=false). `SEED_DISTRICTS`에 없는 동네는
 * 빈 배열 — 「제보 없는 동네」 빈 상태에 실제로 도달할 수 있어야 한다(백로그 「공통」#4).
 * 46종 × 100여 개 동을 미리 다 만들면 1만 건이 넘어 렌더마다 정렬 비용이 커지므로, 시드 대상
 * 동네여도 **요청된 동네만 만들고 캐시**한다. 이미 수기 시드가 있는 품목은 건너뛴다
 * (삼성동 감자 등 Figma 정합값 보존). 캐시 키에 오늘 날짜를 포함해, 서버 프로세스가 자정을
 * 넘겨 계속 떠 있어도(로컬 개발 서버 등) 다음날 재계산되게 한다.
 */
const neighborhoodCache = new Map<string, Report[]>();

export function getNeighborhoodSeedReports(district: string): Report[] {
  if (!SEED_DISTRICTS.includes(district)) return [];

  const cacheKey = `${district}::${todayIso()}`;
  const cached = neighborhoodCache.get(cacheKey);
  if (cached) return cached;

  const handSeeds = buildHandSeedReports().filter((r) => r.district === district);
  const authored = new Set(
    [...buildHandSeedReports(), ...buildMySeedReports()]
      .filter((r) => r.district === district)
      .map((r) => r.vegetableId),
  );
  const region = REGIONS.find((r) => r.label === district);
  const regionId = region?.id ?? `unknown-${district}`;

  const generated: Report[] = [];
  for (const veg of VEGETABLES) {
    if (authored.has(veg.id)) continue;
    const base = BASE_PRICE[veg.id] ?? 3000;
    const seed = hashSeed(`${regionId}-${veg.id}`);
    const count = 4 + (seed % 2); // 기본 3건 + 더보기에서 1~2건 노출
    for (let i = 0; i < count; i++) {
      // 기준가 대비 -10~+10% 편차 · 최근 2주 내 날짜 (모두 seed로 결정)
      const price = round10(base * (1 + (((seed + i * 37) % 21) - 10) / 100));
      const daysAgo = (seed + i * 5) % 14;
      generated.push({
        id: `nb-${regionId}-${veg.id}-${i}`,
        vegetableId: veg.id,
        district,
        place: STORE_NAME_POOL[(seed + i) % STORE_NAME_POOL.length],
        weightKg: 1,
        price,
        pricePerKg: price,
        createdAt: daysAgoAt(daysAgo, "09:00:00"),
        method: i % 2 === 0 ? "photo" : "manual",
        mine: false,
        purchased: true,
        nickname: NEIGHBOR_NICKNAME_POOL[(seed + i * 7) % NEIGHBOR_NICKNAME_POOL.length],
      });
    }
  }

  const result = [...handSeeds, ...generated];
  neighborhoodCache.set(cacheKey, result);
  return result;
}

/** 찜 시드 — 첫 방문에도 마이페이지 "찜한 야채"가 비지 않게(vegetableId). */
export const SEED_FAVORITES: string[] = ["potato", "onion"];
