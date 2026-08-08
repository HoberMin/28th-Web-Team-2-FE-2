// F04 찜 화면의 **더미 데이터**. 실연결(찜 저장소·가게 영업시간·거리 계산)은 별도 사이클이다.
//
// 야채는 `app/_lib/vegetables.ts`(카탈로그 46종·기준 시세 더미)에서, 가게 이름은 같은 파일의
// 가게명 풀에서 **읽기만** 해서 만든다 — 저 파일들은 이 작업에서 수정하지 않는다.
// 등락·거리·영업시간은 대응하는 도메인 모듈이 없어(찜 화면 전용 표기) 여기 로컬 상수로 둔다.

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
  /** 예: "100,000원" */
  trendAmount: string;
  /** 예: "(-7.4%)" */
  trendPercent: string;
}

// ⚠️ 등락은 **하락만** 표현된다. 공통 컴포넌트 `GridVegetableItem`(F02와 공유)이 등락 방향
//    (VegetableTrend의 state 축)을 props로 열어 두지 않아 항상 down으로 그려지기 때문이다.
//    이 화면에서 그 컴포넌트를 고치지 않는 게 이번 작업의 경계라, 더미도 하락 값만 넣어
//    화면과 데이터가 어긋나지 않게 맞췄다. (F02 쪽과 함께 볼 항목으로 보고했다)
const SAVED_VEGETABLE_SEED: { id: string; trendAmount: number; trendPercent: string }[] = [
  { id: "cucumber", trendAmount: 100_000, trendPercent: "(-7.4%)" },
  { id: "onion", trendAmount: 320, trendPercent: "(-8.1%)" },
  { id: "potato", trendAmount: 210, trendPercent: "(-5.2%)" },
  { id: "tomato", trendAmount: 540, trendPercent: "(-9.6%)" },
  { id: "carrot", trendAmount: 180, trendPercent: "(-4.4%)" },
  { id: "garlic", trendAmount: 760, trendPercent: "(-6.3%)" },
  { id: "sweet-potato", trendAmount: 230, trendPercent: "(-3.1%)" },
  { id: "bell-pepper", trendAmount: 410, trendPercent: "(-7.9%)" },
  { id: "spinach", trendAmount: 150, trendPercent: "(-2.8%)" },
];

export const SAVED_VEGETABLES: SavedVegetable[] = SAVED_VEGETABLE_SEED.flatMap(
  ({ id, trendAmount, trendPercent }) => {
    const vegetable = getVegetable(id);
    if (!vegetable) return [];

    return [
      {
        id,
        name: vegetable.name,
        price: formatWon(getBaselineDummy(id).current),
        unit: `/${vegetable.unit}`,
        trendAmount: formatWon(trendAmount),
        trendPercent,
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
