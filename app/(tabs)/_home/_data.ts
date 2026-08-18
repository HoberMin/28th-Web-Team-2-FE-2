// F01 홈 화면 로컬 더미 데이터.
//
// 왜 여기에 있나: `app/_lib/`에 이미 있는 홈 관련 모듈(home-data.ts·card-news.ts)은
// **프로토타입(app/prototype)의 46종 그리드**를 위한 것이라 F01의 화면 요구와 모양이 다르다.
//   · home-data.ts  → server-only + KAMIS 인증키 의존. F01은 "가게별 제보 최저가"라 형태가 다르다.
//   · card-news.ts  → {title, body, changePct}. Figma card/news는 {썸네일, 제목, 날짜, 외부링크}다.
// 두 파일 모두 이 작업의 수정 대상이 아니므로(다른 화면이 쓰고 있다) F01은 화면 로컬 더미를 쓴다.
// 실제 API가 붙으면 이 파일을 서버 fetch로 교체하면 되고, 컴포넌트 시그니처는 그대로다.
//
// ⚠️ Figma 시안의 더미는 10행이 전부 "양파 / 농협하나로마트 / 24,900원 / (-7.4%)"로 동일하다.
//    그대로 옮기면 한국어 말줄임·가변폭이 실제로 되는지 확인할 수 없어서, 1행만 Figma 원본과
//    똑같이 두고 나머지는 길이가 제각각인 품목명·가게명으로 채웠다. 값 자체는 전부 더미다.

/** 추천 가게 카드(card/recommended-store) 한 장. */
export interface HomeRecommendedStore {
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

/** 위치 칩에 뜨는 현재 지역. Figma 시안 값. */
export const HOME_REGION = "광진구";

export const HOME_RECOMMENDED_STORE: HomeRecommendedStore | null = {
  name: "농협하나로마트",
  distance: "460m",
  summaryLabel: "공공 시세보다 저렴한 야채",
  summaryValue: "12가지",
  vegetables: ["양파", "대추방울토마토", "얼갈이배추", "새송이버섯", "고춧가루(중국산)"],
  moreCount: 7,
};

/**
 * 최저가 목록. 접힌 상태에서 5행, "더보기"를 누르면 10행까지 보인다
 * (Figma F01_홈 298:3477 = 5행 / F01_홈_더보기 298:3509 = 10행).
 *
 * 등락은 세 방향을 섞어 뒀다. 예전에는 전부 하락뿐이었는데, 그건 `text/vegetable-trend`에
 * down 변형밖에 없던 시절의 제약이었다 — 지금은 state 축(down·up·flat)과 방향 아이콘
 * (`icon/trend-down`·`trend-up`·`trend-flat`)이 모두 Figma에 등록돼 있다.
 */
export const HOME_LOWEST_VEGETABLES: HomeLowestVegetable[] = [
  // 1행만 Figma 시안 값 그대로.
  {
    id: "onion",
    name: "양파",
    storeName: "농협하나로마트",
    price: "24,900원",
    unit: "/100kg",
    trend: "down",
    trendAmount: "100,000원",
    trendRate: 7.4,
  },
  {
    id: "cabbage",
    name: "배추",
    storeName: "광진시장 청과",
    price: "3,180원",
    unit: "/1포기",
    trend: "up",
    trendAmount: "420원",
    trendRate: 11.7,
  },
  {
    id: "napa",
    name: "얼갈이배추",
    storeName: "자양동 새벽채소",
    price: "2,450원",
    unit: "/1단",
    trend: "flat",
    trendAmount: "0원",
    trendRate: 0,
  },
  {
    id: "tomato",
    name: "대추방울토마토",
    storeName: "구의동 하나청과물상회",
    price: "8,900원",
    unit: "/1kg",
    trend: "down",
    trendAmount: "1,100원",
    trendRate: 11,
  },
  {
    id: "mushroom",
    name: "새송이버섯",
    storeName: "중곡제일시장 버섯나라",
    price: "2,980원",
    unit: "/1팩",
    trend: "up",
    trendAmount: "220원",
    trendRate: 6.9,
  },
  {
    id: "chili-powder",
    name: "고춧가루(중국산)",
    storeName: "능동 로데오 반찬가게",
    price: "12,400원",
    unit: "/1kg",
    trend: "down",
    trendAmount: "900원",
    trendRate: 6.8,
  },
  {
    id: "spinach",
    name: "시금치",
    storeName: "화양동 채소마당",
    price: "3,600원",
    unit: "/1단",
    trend: "flat",
    trendAmount: "0원",
    trendRate: 0,
  },
  {
    id: "garlic",
    name: "깐마늘",
    storeName: "농협하나로마트",
    price: "9,750원",
    unit: "/1kg",
    trend: "up",
    trendAmount: "610원",
    trendRate: 5.9,
  },
  {
    id: "carrot",
    name: "당근",
    storeName: "군자동 알뜰상회",
    price: "2,240원",
    unit: "/1kg",
    trend: "down",
    trendAmount: "160원",
    trendRate: 6.7,
  },
  {
    id: "cucumber",
    name: "오이",
    storeName: "광장동 그린마트",
    price: "1,180원",
    unit: "/1개",
    trend: "down",
    trendAmount: "170원",
    trendRate: 12.6,
  },
];

/** 접힌 상태에서 보이는 행 수. Figma F01_홈이 5행이다. */
export const HOME_LOWEST_COLLAPSED_COUNT = 5;

/**
 * 최근 시세 뉴스. 제목·날짜는 Figma 시안 값, URL은 Figma 개발 주석에 적힌 참고용 링크다
 * (298:3537 "카드 클릭 시 뉴스로 이동(링크)").
 */
export const HOME_NEWS: HomeNewsItem[] = [
  {
    id: "news-1",
    title: "양파 가격 폭락에 농가 울상...'상생' 할인 판매",
    date: "2026.08.01",
    url: "https://www.ytn.co.kr/_ln/0115_202608010201332426",
  },
  {
    id: "news-2",
    title: "올해 보리 생산량 47.3% 증가…마늘·양파도 소폭 늘어",
    date: "2026.07.30",
    url: "https://www.newsis.com/view/NISX20260730_0003729538",
  },
  {
    id: "news-3",
    title: "올해 보리 생산량 47.3% 증가…마늘·양파도 소폭 늘어",
    date: "2026.07.30",
    url: "https://www.newsis.com/view/NISX20260730_0003729538",
  },
];
