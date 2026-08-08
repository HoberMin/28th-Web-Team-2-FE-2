// F04 찜 화면의 **더미 데이터**. 실연결(찜 저장소·가게 영업시간·거리 계산)은 별도 사이클이다.
//
// 야채는 `app/_lib/vegetables.ts`(카탈로그 46종·기준 시세 더미)에서, 가게 이름은 같은 파일의
// 가게명 풀에서 **읽기만** 해서 만든다 — 저 파일들은 이 작업에서 수정하지 않는다.
// 등락·거리·영업시간은 대응하는 도메인 모듈이 없어(찜 화면 전용 표기) 여기 로컬 상수로 둔다.

import type { VegetableTrendState } from "../../_components/vegetable-trend";
import { formatWon } from "../../_lib/format";
import {
  HAND_SEED_STORE_NAMES,
  STORE_NAME_POOL,
  getBaselineDummy,
  getVegetable,
} from "../../_lib/vegetables";
import type { SavedStoreOpenState } from "./_components/row-saved-store";

/** URL 쿼리 `?tab=` 값. 기본은 야채 탭(Figma의 첫 화면 F04_찜_야채). */
export type SavedTab = "vegetable" | "store";

export const DEFAULT_SAVED_TAB: SavedTab = "vegetable";

export function parseSavedTab(value: string | undefined): SavedTab {
  return value === "store" ? "store" : DEFAULT_SAVED_TAB;
}

export interface SavedVegetable {
  id: string;
  name: string;
  /** 예: "2,490원" */
  price: string;
  /** 예: "/1kg" */
  unit: string;
  /** 등락 **방향**. 색·부호·방향 아이콘이 전부 이 값 하나에서 파생된다. */
  trendState: VegetableTrendState;
  /** 예: "100,000원". flat이면 빈 문자열 — Figma의 flat 심볼엔 값 텍스트가 없다. */
  trendAmount: string;
  /** 예: "(-7.4%)". 부호는 `trendState`에서 파생시킨다(하드코딩하지 않는다). */
  trendPercent: string;
}

// 등락은 **방향을 데이터로** 들고, 부호·색·아이콘은 그 방향에서 파생시킨다.
// (이전에는 `trendPercent`에 "(-7.4%)"처럼 부호를 박아 두고 방향은 넘기지 않아,
//  같은 야채가 F02에서는 상승인데 F04에서는 하락(파랑)으로 보이는 모순이 있었다.)
// 세 방향이 화면에 다 보이도록 더미에 상승·보합을 섞는다.
const SAVED_VEGETABLE_SEED: {
  id: string;
  trendState: VegetableTrendState;
  /** 등락 금액(원). flat이면 쓰이지 않는다. */
  diff: number;
  /** 등락률(%). 부호 없이 크기만 둔다 — 부호는 방향에서 붙인다. flat이면 쓰이지 않는다. */
  pct: number;
}[] = [
  { id: "cucumber", trendState: "down", diff: 100_000, pct: 7.4 },
  { id: "onion", trendState: "up", diff: 320, pct: 8.1 },
  { id: "potato", trendState: "flat", diff: 0, pct: 0 },
  { id: "tomato", trendState: "down", diff: 540, pct: 9.6 },
  { id: "carrot", trendState: "up", diff: 180, pct: 4.4 },
  { id: "garlic", trendState: "down", diff: 760, pct: 6.3 },
  { id: "sweet-potato", trendState: "up", diff: 230, pct: 3.1 },
  { id: "bell-pepper", trendState: "flat", diff: 0, pct: 0 },
  { id: "spinach", trendState: "down", diff: 150, pct: 2.8 },
];

export const SAVED_VEGETABLES: SavedVegetable[] = SAVED_VEGETABLE_SEED.flatMap(
  ({ id, trendState, diff, pct }) => {
    const vegetable = getVegetable(id);
    if (!vegetable) return [];

    const hasChange = trendState !== "flat";

    return [
      {
        id,
        name: vegetable.name,
        price: formatWon(getBaselineDummy(id).current),
        unit: `/${vegetable.unit}`,
        trendState,
        trendAmount: hasChange ? formatWon(diff) : "",
        // 방향을 색에만 맡기지 않도록 부호를 문자열에 담는다(WCAG 1.4.1).
        trendPercent: hasChange ? `(${trendState === "up" ? "+" : "-"}${pct}%)` : "",
      },
    ];
  },
);

export interface SavedStore {
  id: string;
  name: string;
  /** 예: "0.2km" */
  distance: string;
  openState: SavedStoreOpenState;
  openLabel: string;
  /** 예: "수 10:00 - 22:00" */
  hours: string;
}

// Figma는 6행이다(298-3598 ~ 298-3603). 이름만 도메인 모듈의 가게명 풀에서 가져오고
// 거리·영업시간은 저충실도 더미다.
const SAVED_STORE_SEED: Omit<SavedStore, "name">[] = [
  { id: "s1", distance: "0.2km", openState: "closed", openLabel: "영업종료", hours: "수 10:00 - 22:00" },
  { id: "s2", distance: "0.4km", openState: "open", openLabel: "영업중", hours: "수 09:00 - 21:00" },
  { id: "s3", distance: "0.6km", openState: "open", openLabel: "영업중", hours: "수 08:30 - 20:00" },
  { id: "s4", distance: "0.9km", openState: "closed", openLabel: "영업종료", hours: "수 10:00 - 19:00" },
  { id: "s5", distance: "1.1km", openState: "open", openLabel: "영업중", hours: "수 09:30 - 22:00" },
  { id: "s6", distance: "1.4km", openState: "open", openLabel: "영업중", hours: "수 10:00 - 23:00" },
];

const SAVED_STORE_NAMES = [...STORE_NAME_POOL, ...HAND_SEED_STORE_NAMES];

export const SAVED_STORES: SavedStore[] = SAVED_STORE_SEED.map((store, index) => ({
  ...store,
  name: SAVED_STORE_NAMES[index % SAVED_STORE_NAMES.length],
}));
