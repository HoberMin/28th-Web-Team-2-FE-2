// 야채 시세 UT 프로토타입 — 도메인 타입 (격리 라우트 전용, design-guide §1-2).

export type VegetableCategory = "식량작물" | "채소류" | "과일";

/**
 * 가격 기준 단위 종류 — `kamis-vegetable-data-spec.md` 단위 정책과 1:1.
 * kg·g는 `p_convert_kg_yn=Y`, 개·포기는 소비자가 실제로 그 단위로 사므로 `N`.
 */
export type VegetableUnit = "kg" | "g" | "개" | "포기";

/**
 * 화면에서 46종을 찾기 쉽게 묶는 단위 — KAMIS 부류코드(100/200)는 2개뿐이라 필터로 쓸 수 없다.
 * "장 볼 때 머릿속에서 묶는 방식"에 맞춘 분류다(식물학 분류가 아니다).
 */
export type VegetableGroup = "감자·뿌리" | "잎채소" | "열매채소" | "고추" | "양념" | "버섯" | "과채";

/** 비수기에 KAMIS 데이터가 아예 없는 계절 품목(수박·참외·딸기·갓) 표기. */
export interface SeasonWindow {
  /** 데이터가 존재하는 월(1~12). */
  months: number[];
  /** 사용자에게 보여줄 한 줄. 예: "여름 한정" */
  label: string;
}

export interface Vegetable {
  /** slug (URL·키). 예: "potato" */
  id: string;
  /** 표시명. 예: "감자" */
  name: string;
  /** Figma에서 추출한 야채 일러스트 경로 (public). 없으면 emoji로 폴백. */
  image?: string;
  /** 일러스트 없는 품목의 대체 표시 + 이미지 로드 전 폴백 */
  emoji: string;
  category: VegetableCategory;
  /** 가격 기준 단위 표시값. 예: "1kg", "1개", "100g" */
  unit: string;
  /** 단위 종류 — 제보 폼 입력 단위·환산 규칙을 이 값으로 분기한다. */
  unitType: VegetableUnit;
  /** KAMIS 부류코드 — 규격상 100(식량작물) 또는 200(채소류) 둘 중 하나. */
  itemCategoryCode: string;
  /** KAMIS 품목코드 */
  itemCode: string;
  /**
   * KAMIS 품종코드. 가격 조회는 itemCode만으로 안 되고 kindCode까지 필요하다.
   * 배추(211)·무(231)는 품종이 아니라 계절로 갈려 `seasonalKindCodes`를 쓴다.
   */
  kindCode: string;
  /** 품종 설명(디자이너·백엔드가 어떤 품종인지 알아보게). 예: "수미·노지" */
  kindLabel?: string;
  /**
   * 배추·무 전용 — 봄/여름고랭지/가을/월동 중 **살아있는 시즌만** 평균한다.
   * 캘린더로 고정하지 않고 매번 전부 조회해 응답 있는 것만 쓰는 게 규격.
   */
  seasonalKindCodes?: string[];
  /** 연중 아닌 품목의 데이터 존재 구간. 비수기 빈 상태 문구·제철 판정에 쓴다. */
  season?: SeasonWindow;
}

export type PricePeriod = "week" | "month" | "year";

/** 전일 대비 등락 — 홈 그리드·시세 헤더에서 "어제보다 올랐나"를 즉시 보여주는 값. */
export interface PriceTrend {
  direction: "up" | "down" | "flat";
  /** 절대 변화액(원, 양수) */
  diff: number;
  /** 변화율(%, 양수, 소수 1자리까지) */
  pct: number;
}

/**
 * 시장에서 실제로 파는 단위 → 기준 단위 환산 옵션.
 * 시장은 "감자 1망 5,000원"처럼 팔아서, kg 기준 시세와 비교하려면 환산이 먼저 필요하다.
 */
export interface MarketUnitOption {
  /** 사용자가 고르는 단위명. 예: "1망", "1단", "1봉지" */
  label: string;
  /** 기준 단위(unitType) 기준 수량. 예: 1망 = 1.5kg → 1.5 */
  ratio: number;
  /** 환산 근거 메모(디자이너·백엔드 확인용) */
  note?: string;
}

/** 즉석 판단(신호등) 결과 — 입력한 가격이 기준 대비 어디쯤인지. */
export type PriceVerdict = "cheap" | "fair" | "expensive";

export interface PricePoint {
  /** "YYYY-MM-DD" */
  date: string;
  /** 원 */
  price: number;
}

/** 공공 시세(기준선) — KAMIS 또는 더미. 지역 해상도는 광역(서울)이 한계. */
export interface BaselinePrice {
  vegetableId: string;
  /** 광역 단위. 예: "서울" (공공 API가 동 단위 미제공 — API 조사 결론) */
  region: string;
  unit: string;
  /** 현재 시세(원) */
  current: number;
  /** 평균가(원) */
  average: number;
  series: Record<PricePeriod, PricePoint[]>;
  source: "kamis" | "dummy";
  /** 조사 기준일 "YYYY-MM-DD" — 실데이터는 `series.week` 마지막 포인트 날짜, 더미는 오늘 */
  asOf: string;
  /** 더미로 폴백됐는지 — true면 화면에 "예시 데이터" 등 구분 표시 근거로 쓴다 */
  isFallback: boolean;
}

/** 비교에 쓰는 온라인 판매 채널. */
export type OnlineMall = "컬리" | "오아시스" | "GS SHOP" | "11번가";

/**
 * 채널 성격 — 단순 최저가 나열이 왜곡을 만들기 때문에 반드시 함께 보여준다.
 * 오아시스는 새벽배송, GS SHOP·11번가는 오픈마켓이라 배송 조건과 판매자 편차가 있다.
 * 성격을 숨기고 금액만 줄 세우면 배송 조건이 다른 가격을 같은 상품처럼 오해하게 된다.
 */
export type OnlineChannelKind = "새벽배송" | "당일배송" | "오픈마켓" | "즉시배송";

/**
 * 온라인 판매가 — **보조 기준**이다(기획안 §3: 온라인 비교의 독립 메인 기능화 제외).
 * 비교 단위를 품목 기준 단위(1kg·1개·100g)로 환산해 저장한다.
 * 환산이 불가한 SKU(묶음·박스만 파는 경우)는 엔트리를 두지 않는다 — 억지 환산이 더 위험하다.
 */
export interface MartPrice {
  vegetableId: string;
  mall: OnlineMall;
  /** 환산 근거가 된 실제 SKU 상품명 — 단위·등급 왜곡 방지용 출처 표기. */
  productName: string;
  /** 비교 단위(품목 기준 단위와 정합). */
  unit: string;
  /** 기준 단위 환산 판매가(원) */
  price: number;
  channel: OnlineChannelKind;
  /** 가격 해석에 필요한 단서. 예: "배송비 별도", "회원가" */
  channelNote?: string;
  /** 기준일 "YYYY-MM-DD" */
  asOf: string;
}

/** 사용자 제보 실제가 — 동네(동) 정밀도를 메우는 크라우드소싱 데이터. */
export interface Report {
  id: string;
  vegetableId: string;
  /** 동네(동). 예: "봉천동" */
  district: string;
  /** 제보 지점(가게명). GPS+검색으로 특정하거나 직접 입력. 미선택 시 undefined(동까지만). */
  place?: string;
  /** 구매 무게(kg) */
  weightKg: number;
  /** 지불 가격(원) */
  price: number;
  /** 1kg 환산가(원) */
  pricePerKg: number;
  /** ISO 8601 */
  createdAt: string;
  /** 입력 경로 */
  method: "photo" | "manual";
  /**
   * 내가 올린 제보인지 여부.
   * mine=true 제보가 곧 내 마이페이지 "제보 내역"이 된다. 시드된 동네 이웃 제보는 mine=false.
   */
  mine: boolean;
  /**
   * @deprecated 구매 인증 개념 폐기(2026-08-04) — 제보 폼에서 묻지 않고, 새 제보는 항상 true다.
   * 시드·기존 저장값이 이 필드를 갖고 있어 타입에만 남겨 둔다. 화면에서 이 값으로 분기하지 말 것.
   */
  purchased: boolean;
  /**
   * 작성자 닉네임(공개값 — 본명 아님). 제보왕(F06) 리더보드·공개 제보 목록의 소스.
   * mine=true 제보는 항상 **현재 온보딩 닉네임**으로 표시된다(닉네임 변경 시 과거 내 제보도 갱신 —
   * reports-store.ts가 읽기 시점에 덮어씀). mine=false 이웃 시드는 고정 이웃 닉네임.
   */
  nickname: string;
}
