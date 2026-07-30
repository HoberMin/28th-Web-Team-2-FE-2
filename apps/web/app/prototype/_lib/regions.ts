// 온보딩·홈·설정이 공유하는 지역 목록 — 동 단위. 구 단위는 너무 넓어 "동네" 체감이 안 난다.
//
// 데이터 출처: datainworld/administrative_district 의 `서울시_행정동_중심점_2017.csv`
// (통계청 기준 서울 행정동 424개 + 각 동 중심점 WGS84 실좌표). 여기에 기존 경기 주요 동 27개를
// 더해 451개. KAMIS가 서울 광역 시세만 제공하므로 서울을 전부 덮는 것으로 충분하다.
//
// 두 군데를 손봤다. 이유가 없으면 되돌리지 말 것:
//  ① 강남구는 행정동 기준으로 "삼성1동·삼성2동"이지만, 이 프로토타입의 기준 지역
//     (`DEFAULT_DISTRICT`)과 시드 제보가 전부 **"삼성동"**(선릉 일대)에 달려 있다.
//     둘을 "삼성동" 하나로 합치고 좌표는 선릉 기준으로 뒀다.
//  ② 관악구에도 행정동 "삼성동"이 있어 이름이 겹친다 → "관악구 삼성동"으로 구분.
//     같은 이유로 강남구/은평구에 겹치는 "신사동"도 구를 앞에 붙였다.
import regionsData from "./regions-data.json";

export interface Region {
  id: string;
  label: string;
  /** 동 중심 근사 좌표(위도, 경도) — "지금 있는 동네" 거리순 정렬용. */
  lat: number;
  lng: number;
}

export const REGIONS: Region[] = regionsData;

/** 지역명 부분일치 필터(간단 검색). */
export function searchRegions(query: string): Region[] {
  const q = query.trim();
  if (!q) return REGIONS;
  return REGIONS.filter((r) => r.label.includes(q));
}

// 하버사인 거리(km) — 정렬 비교용이라 절대값 정확도는 필요 없다.
function distanceKm(a: Region, b: Region): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * 앵커 지역(현재 위치)에서 가까운 순으로 상위 `limit`개.
 * 앵커 자신이 맨 앞(거리 0)에 온다. 앵커를 못 찾으면 원본 순서에서 상위 `limit`개.
 * "지금 있는 동네" 섹션에서 사용 — 검색 입력과는 별개 경로.
 */
export function regionsByProximity(anchorLabel: string, limit = 4): Region[] {
  const anchor = REGIONS.find((r) => r.label === anchorLabel);
  if (!anchor) return REGIONS.slice(0, limit);
  return [...REGIONS].sort((a, b) => distanceKm(anchor, a) - distanceKm(anchor, b)).slice(0, limit);
}
