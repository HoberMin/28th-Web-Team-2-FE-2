// 랭킹(F06) 더미 데이터 — 동 단위 고정. 실서비스 전환 시 reports-store 집계로 교체.

export interface LowPriceRankItem {
  vegetableId: string;
  name: string;
  emoji: string;
  price: number;
  discountPct: number;
  place: string;
}

export interface ReporterRankItem {
  rank: number;
  nickname: string;
  reportCount: number;
}

/** 동 단위 오늘의 최저가 Top 5 (더미). */
export const LOW_PRICE_RANKING: LowPriceRankItem[] = [
  { vegetableId: "potato", name: "감자", emoji: "🥔", price: 2000, discountPct: 20, place: "우리농산물가락직판장" },
  { vegetableId: "onion", name: "양파", emoji: "🧅", price: 1700, discountPct: 14, place: "행복청과" },
  { vegetableId: "carrot", name: "당근", emoji: "🥕", price: 2600, discountPct: 10, place: "이마트 강남점" },
  { vegetableId: "garlic", name: "마늘", emoji: "🧄", price: 7900, discountPct: 11, place: "우리농산물가락직판장" },
  { vegetableId: "tomato", name: "토마토", emoji: "🍅", price: 4600, discountPct: 12, place: "행복청과" },
];

/** 이번 주 동 단위 제보왕 리더보드 (더미). */
export const REPORTER_RANKING: ReporterRankItem[] = [
  { rank: 1, nickname: "선릉이웃", reportCount: 12 },
  { rank: 2, nickname: "청과왕민지", reportCount: 9 },
  { rank: 3, nickname: "알뜰장보기", reportCount: 7 },
  { rank: 4, nickname: "야채러버", reportCount: 5 },
  { rank: 5, nickname: "동네지킴이", reportCount: 4 },
];
