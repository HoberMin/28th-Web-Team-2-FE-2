// 홈(F01) 서버 데이터 조립 — 46종 기준선을 서버에서 모아 **화면에 필요한 값만** 클라로 내린다.
// ⚠️ 서버 전용: kamis.ts(인증키)를 import하므로 클라이언트에서 쓰지 않는다.
//
// 왜 이 파일이 있나: 홈 그리드가 이모지만 보여줘서 "어느 야채를 볼지" 정할 정보가 없었다.
// 시세와 전일 대비 등락을 그리드에 얹으려면 46종 기준선이 필요한데, 시리즈 전체(약 2,200 포인트)를
// 클라로 보내면 페이로드가 과해진다 → 여기서 요약 DTO로 줄인다.

import "server-only";
import { getBaselinePrice } from "./kamis";
import { getDailyTrend, pickSeasonalBargains, type SeasonalPick } from "./trend";
import { getVegetableGroup, isInSeason, VEGETABLES, POPULAR_IDS } from "./vegetables";
import type { PriceTrend, VegetableGroup } from "./types";

/** 홈 그리드 한 칸에 필요한 최소 정보. */
export interface HomeVegetableItem {
  id: string;
  name: string;
  emoji: string;
  image?: string;
  unit: string;
  /** 오늘 시세(원, 기준 단위). 비수기로 데이터가 없으면 null. */
  price: number | null;
  /** 전일 대비 등락. 계산 불가면 null. */
  trend: PriceTrend | null;
  /** 지금 달에 조사되는 품목인지 */
  inSeason: boolean;
  /** 비수기 품목의 안내 문구. 예: "여름 한정" */
  seasonLabel?: string;
  /** 홈 필터 칩용 그룹 */
  group: VegetableGroup;
}

export interface HomeData {
  items: HomeVegetableItem[];
  /** 이번 달 저점권 품목 — "지금 사면 싸다"를 먼저 알려주는 섹션 */
  seasonalPicks: SeasonalPick[];
  /** 기준 월(1~12) */
  month: number;
}

/**
 * 홈 데이터 조립.
 * 인기 8종(일러스트 보유)을 앞에 두고 나머지를 이름 순으로 잇는다 — 검색은 클라에서 이 배열을 필터한다.
 */
export async function getHomeData(): Promise<HomeData> {
  const month = new Date().getMonth() + 1;

  const baselines = await Promise.all(
    VEGETABLES.map(async (veg) => ({ veg, baseline: await getBaselinePrice(veg.id) })),
  );

  const items: HomeVegetableItem[] = baselines.map(({ veg, baseline }) => {
    const inSeason = isInSeason(veg, month);
    return {
      id: veg.id,
      name: veg.name,
      emoji: veg.emoji,
      image: veg.image,
      unit: veg.unit,
      price: inSeason ? baseline.current : null,
      trend: inSeason ? getDailyTrend(baseline.series.week) : null,
      inSeason,
      seasonLabel: veg.season?.label,
      group: getVegetableGroup(veg.id),
    };
  });

  const popularRank = new Map(POPULAR_IDS.map((id, i) => [id, i]));
  items.sort((a, b) => {
    const ra = popularRank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const rb = popularRank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name, "ko");
  });

  return {
    items,
    seasonalPicks: pickSeasonalBargains(baselines, month),
    month,
  };
}

/**
 * 품목 → 오늘 시세 맵. **클라이언트 화면이 시세를 다시 계산하지 않게** 하는 통로다.
 * (제보는 localStorage에 있어 클라에서만 읽히는데, 비교 기준까지 클라에서 더미로 만들면
 *  KAMIS 연결 시 서버 화면과 숫자가 어긋난다 → 기준은 항상 서버에서 내려준다.)
 */
export async function getPriceMap(): Promise<Record<string, number | null>> {
  const { items } = await getHomeData();
  return Object.fromEntries(items.map((i) => [i.id, i.price]));
}

/** 화면들이 같은 "오늘"을 쓰도록 서버 기준일을 내려준다(신선도 계산이 기기 시계에 흔들리지 않게). */
export function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
