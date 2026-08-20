// F01 홈 화면의 표시 모델 타입 + 표기 헬퍼.
//
// **더미 데이터는 없다** — 추천 가게는 `GET /api/v1/stores/recommendation`,
// 최저가 목록은 `GET /api/v1/regions/{regionId}/reports/lowest-prices`,
// 뉴스는 `GET /api/v1/news`가 채운다. DTO→표시 모델 변환은 `home-view.ts`가 한다.
//
// 여기 남은 것은 (1) 화면 컴포넌트가 받는 타입과 (2) 방향에서 부호를 파생시키는 포맷 함수뿐이다.
// 타입을 화면 폴더에 두는 이유: 뉴스 카드처럼 Figma 규격과 API DTO의 모양이 달라서
// 화면이 요구하는 계약을 한 곳에 적어 두어야 매퍼가 무엇을 채워야 하는지 분명해진다.

/** 추천 가게 카드(card/recommended-store) 한 장. */
export interface HomeRecommendedStore {
  /** 가게 상세 화면으로 이동할 Spring storeId(문자열). */
  storeId: string;
  name: string;
  /** 예: "460m" */
  distance: string;
  summaryLabel: string;
  summaryValue: string;
  /** 야채 이름들. Figma 개발 주석: 최대 5개까지만 보여주고 나머지는 more 뱃지로. */
  vegetables: string[];
  /** 5개를 넘어 화면에 못 담은 나머지 개수. */
  moreCount: number;
}

/**
 * 등락 방향. `text/vegetable-trend`(477-5291)의 state 축과 같은 이름을 쓴다 —
 * 색·아이콘·부호가 전부 이 한 값에서 파생되도록 두기 위해서다.
 */
export type HomeTrendDirection = "down" | "up" | "flat";

/** 우리 동네 최저가 야채 한 줄(list/lowest-vegetable). */
export interface HomeLowestVegetable {
  id: string;
  name: string;
  storeName: string;
  /** 예: "24,900원" */
  price: string;
  /** 예: "/100kg" */
  unit: string;
  /** 등락 방향. 부호(`-`/`+`)·아이콘·대체 텍스트가 전부 여기서 파생된다. */
  trend: HomeTrendDirection;
  /** 등락 금액의 **크기**(부호 없음). 예: "100,000원" */
  trendAmount: string;
  /** 등락률의 **크기**(부호 없음, 퍼센트 수치). 예: 7.4 */
  trendRate: number;
}

/** 방향별 표시 부호. flat은 붙일 부호가 없다. */
const TREND_SIGN: Record<HomeTrendDirection, string> = {
  down: "-",
  up: "+",
  flat: "",
};

/**
 * 등락률 표시 문자열. **부호를 데이터에 박아 두지 않고 방향에서 파생한다** —
 * 예전에는 `trendPercent: "(-7.4%)"`처럼 문자열에 부호가 들어 있어서, 데이터가 상승으로 바뀌어도
 * 부호는 하락인 채로 남을 수 있었다.
 */
export function formatTrendPercent(item: HomeLowestVegetable): string {
  // flat은 Figma 심볼에 값 텍스트가 아예 없다 — 금액·증감률 둘 다 빈 문자열로 낸다.
  // (F04 saved/_data.ts와 같은 계약. 실 API가 붙어도 두 화면이 갈리지 않게 맞춰 뒀다.)
  if (item.trend === "flat") return "";
  return `(${TREND_SIGN[item.trend]}${item.trendRate.toFixed(1)}%)`;
}

/** 등락 금액. flat이면 표시하지 않는다(위 formatTrendPercent와 같은 이유). */
export function formatTrendAmount(item: HomeLowestVegetable): string {
  return item.trend === "flat" ? "" : item.trendAmount;
}

/** 최근 시세 뉴스 카드(card/news) 한 장. */
export interface HomeNewsItem {
  id: string;
  title: string;
  /** 예: "2026.08.01" — 포맷팅은 데이터 쪽 책임(CardNews는 문자열을 그대로 그린다). */
  date: string;
  /** Figma 개발 주석: "카드 클릭 시 뉴스로 이동(링크)". 외부 기사 URL. */
  url: string;
  /** 외부 기사 썸네일. 응답에 없거나 안전한 URL이 아니면 렌더하지 않는다. */
  thumbnailUrl?: string;
}

/** 접힌 상태에서 보이는 행 수. Figma F01_홈이 5행이다. */
export const HOME_LOWEST_COLLAPSED_COUNT = 5;
