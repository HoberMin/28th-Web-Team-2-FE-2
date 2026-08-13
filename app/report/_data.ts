import { getFallbackNearbyStores } from "@/app/_lib/nearby-stores";
import { formatDistance } from "@/app/_lib/store-locations";
import { DEFAULT_DISTRICT, VEGETABLES, getVegetable, getVegetableGroup } from "@/app/_lib/vegetables";
import type { VegetableGroup } from "@/app/_lib/types";

// 실측 출처: 장보고 Design `d5j7K9BNpSXxVUu3fmZfY4` / `화면GUI(원본)` 364:6742 — 상세는 `app/report/page.tsx` 머리말.

// F04-1~4 제보 플로우 화면 데이터 — Figma 화면GUI(원본) 364:8063~8317.
//
// **디자인 작업용 더미다.** 실제 제보 저장·조회는 외부 Spring 스펙이 나오면 붙인다
// (`shared/domain.md` TODO). 지금은 화면 정합이 목적이라 레포에 이미 있는 도메인 상수를 재사용한다.
//
// ⚠️ **카테고리 목록이 Figma와 코드에서 다르다.**
//    Figma(364:8069~8090)  8종 — 뿌리채소 · 잎채소 · 열매채소 · 고추류 · 마늘·파·생강 · 버섯류 ·
//                                깨·견과류 · 과일류
//    코드 정본(`VEGETABLE_GROUPS`) 7종 — 감자·뿌리 · 잎채소 · 열매채소 · 고추 · 양념 · 버섯 · 과채
//    → **코드 정본을 썼다.** `app/(tabs)/prices/_group-chips.tsx`가 이미 같은 상황에서
//      "Figma 칩 라벨은 미완성 자리, 코드의 정본 그룹으로 렌더한다"고 판단한 선례가 있어 그걸 따랐다.
//      Figma 8종은 46종 데이터에 존재하지 않는 분류(깨·견과류)까지 포함해서, 그대로 옮기면
//      빈 카테고리가 생긴다. (GUI피드백.md에 기록 — 정본 카테고리 확정 필요)

/** F04-2 1단 — 카테고리 목록. 코드 정본 7종. */
export const REPORT_CATEGORIES: VegetableGroup[] = [
  "감자·뿌리",
  "잎채소",
  "열매채소",
  "고추",
  "양념",
  "버섯",
  "과채",
];

export interface ReportVegetableOption {
  id: string;
  name: string;
  /** 표시 단위. 예: "1kg" — 제보 폼의 단위 선택 기본값이 된다. */
  unit: string;
  /** 단위 종류. 예: "kg" */
  unitType: string;
}

function toOption(id: string): ReportVegetableOption | undefined {
  const veg = getVegetable(id);
  if (!veg) return undefined;
  return { id: veg.id, name: veg.name, unit: veg.unit, unitType: veg.unitType };
}

/** F04-2 2단 — 카테고리 안 야채 목록. */
export function getReportVegetablesByGroup(group: string): ReportVegetableOption[] {
  return VEGETABLES.filter((veg) => getVegetableGroup(veg.id) === group).map((veg) => ({
    id: veg.id,
    name: veg.name,
    unit: veg.unit,
    unitType: veg.unitType,
  }));
}

/**
 * F04-2 검색 — 프레임 364:8111(검색 후 3행) · 364:8121(결과 없음).
 * Figma가 결과를 3행만 보여주지만 그건 샘플 개수라 코드는 자르지 않는다.
 */
export function searchReportVegetables(query: string): ReportVegetableOption[] {
  const q = query.trim();
  if (!q) return [];
  return VEGETABLES.filter((veg) => veg.name.includes(q)).map((veg) => ({
    id: veg.id,
    name: veg.name,
    unit: veg.unit,
    unitType: veg.unitType,
  }));
}

export interface ReportPlaceOption {
  id: string;
  name: string;
  /** 거리 표기. 예: "0.2km" */
  distance: string;
  /** 주소 전문. **더미다** — NearbyStore에 주소 필드가 없다. */
  address: string;
}

/**
 * F04-3 판매 장소 목록 — Figma 364:8300~8302(3행).
 *
 * 주소는 `NearbyStore`에 없는 필드라 더미를 붙였다. Kakao 로컬 검색 응답에는 주소가 있으므로
 * BFF(`app/api/nearby-stores`)가 주소를 실어 주면 이 상수는 지운다.
 */
export function getReportPlaces(): ReportPlaceOption[] {
  return getFallbackNearbyStores(DEFAULT_DISTRICT).map((store) => ({
    id: store.id,
    name: store.name,
    distance: formatDistance(store.distanceM),
    address: `서울 강남구 ${DEFAULT_DISTRICT} ${store.category}`,
  }));
}

/** 제보 폼이 품목 id로 값을 되찾을 때 쓴다. */
export function getReportVegetable(id: string | undefined): ReportVegetableOption | undefined {
  if (!id) return undefined;
  return toOption(id);
}

/** 제보 폼이 장소 id로 값을 되찾을 때 쓴다. */
export function getReportPlace(id: string | undefined): ReportPlaceOption | undefined {
  if (!id) return undefined;
  return getReportPlaces().find((place) => place.id === id);
}
