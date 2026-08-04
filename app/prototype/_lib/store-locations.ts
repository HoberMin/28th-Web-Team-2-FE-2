// 가게 위치 — 지도 핀과 "내 위치에서 얼마나 먼가"를 만든다.
//
// 왜 필요한가: 가게 축 화면(가게 상세·가게 탭)에서 사용자의 다음 질문은 "여기 어디야?"다.
// 가격이 싸도 세 정거장 떨어져 있으면 안 간다 — 절약액과 발걸음은 같이 보여야 판단이 선다.
//
// 좌표는 제보에 실려 오지 않으므로(제보 폼은 가게명만 받는다) **동 중심 + 가게명 해시 오프셋**으로
// 결정적으로 만든다. 매 렌더 같은 값이고, 실서비스에서 Kakao 장소 검색 좌표가 들어오면
// 이 함수만 교체하면 화면은 그대로 동작한다.

import { REGIONS } from "./regions";

export interface StoreLocation {
  lat: number;
  lng: number;
  /** 화면에 그대로 쓰는 주소 문구 */
  address: string;
  /** 동 중심 대비 오프셋(도) — 가짜 지도에서 핀 좌표(%)를 만드는 데 쓴다. 항상 ±0.006 안쪽. */
  latOffset: number;
  lngOffset: number;
}

/** 오프셋(도) → 가짜 지도 박스 안 위치(%, 10~90 사이). 실좌표 투영 없이 상대 위치만 표현한다. */
export function offsetToPercent(offset: number): number {
  return 50 + (offset / 0.006) * 40;
}

/** 문자열 → 안정적 seed (Math.random 없이 결정적 좌표 생성). */
function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) % 1_000_003;
  }
  return h;
}

/** 서울 위도대 기준 1도의 대략 거리(m) — 거리 계산과 오프셋 크기 산정에 함께 쓴다. */
const METERS_PER_LAT_DEG = 111_000;
const METERS_PER_LNG_DEG = 88_000;

/**
 * 가게의 위치. 동 중심에서 최대 700m 안쪽으로 흩어 놓는다
 * (같은 동 안의 가게들이 한 점에 겹쳐 보이지 않게).
 */
export function getStoreLocation(storeName: string, district: string): StoreLocation {
  const region = REGIONS.find((r) => r.label === district);
  const seed = hashSeed(`${district}-${storeName}`);

  // -0.006 ~ +0.006도 → 위도 ±660m, 경도 ±530m
  const latOffset = ((seed % 121) - 60) / 10_000;
  const lngOffset = (((seed >> 3) % 121) - 60) / 10_000;

  return {
    lat: (region?.lat ?? 37.514) + latOffset,
    lng: (region?.lng ?? 127.056) + lngOffset,
    address: `${district} ${100 + (seed % 400)}-${1 + (seed % 60)}`,
    latOffset,
    lngOffset,
  };
}

/** 두 좌표 사이 거리(m). 동네 안 거리라 평면 근사로 충분하다. */
export function distanceMeters(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const dLat = (to.lat - from.lat) * METERS_PER_LAT_DEG;
  const dLng = (to.lng - from.lng) * METERS_PER_LNG_DEG;
  return Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
}

/** 거리 표기 — 1km 미만은 10m 단위, 이상은 소수 첫째 자리 km. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/** 도보 소요 시간(분) — 분속 67m(시속 4km) 기준. 거리보다 "갈 만한가"가 바로 읽힌다. */
export function walkMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 67));
}
