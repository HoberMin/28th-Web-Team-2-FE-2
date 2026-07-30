// 가게 위치 선택(제보 폼 내 drawer) — GPS 반경 + Kakao 로컬 키워드 검색(청과·채소·과일·마트) 실연결.
// 클라(드로어)에서 좌표를 얻어 BFF(app/api/nearby-stores)를 호출한다 — KAKAO_REST_KEY는 서버까지만.
// 키 미설정·업스트림 실패·응답 파싱 실패는 전부 조용히 더미로 폴백(동 단위 결정적 값).

export interface NearbyStore {
  id: string;
  /** 가게명 */
  name: string;
  /** Kakao category_name 세부 계층(예: "과일,채소가게") */
  category: string;
  /** 대략 거리(m) — 정렬용 */
  distanceM: number;
}

/** 동(행정동)별 결정적 더미 목록(임의값 아님 — 매 렌더 동일 결과). BFF 실패 시 클라·서버 양쪽의 최종 폴백. */
const DUMMY_STORES: Record<string, NearbyStore[]> = {
  삼성동: [
    { id: "s1", name: "우리농산물가락직판장", category: "과일,채소가게", distanceM: 120 },
    { id: "s2", name: "행복청과", category: "과일,채소가게", distanceM: 210 },
    { id: "s3", name: "이마트 강남점", category: "대형마트", distanceM: 480 },
  ],
};

const FALLBACK_STORES: NearbyStore[] = [
  { id: "f1", name: "동네청과", category: "과일,채소가게", distanceM: 150 },
  { id: "f2", name: "행복마트", category: "대형마트", distanceM: 300 },
];

/** BFF·클라 양쪽이 공유하는 최종 폴백 — 동에 시드가 있으면 그 값, 없으면 범용 더미. */
export function getFallbackNearbyStores(district: string): NearbyStore[] {
  return DUMMY_STORES[district] ?? FALLBACK_STORES;
}

/**
 * 현재 좌표 기준 근처 청과·마트 목록을 BFF(app/api/nearby-stores)에서 가져온다.
 * 네트워크 실패·비정상 응답·파싱 실패는 모두 더미로 폴백한다 — 이 화면에서 에러 상태를 별도로
 * 보여주지 않는 이유는 위치 선택이 제보 플로우의 중간 단계라 여기서 막히면 이탈로 이어지기 때문.
 */
export async function getNearbyStores(
  coords: { lat: number; lng: number },
  district: string,
): Promise<NearbyStore[]> {
  try {
    const res = await fetch(`/api/nearby-stores?lat=${coords.lat}&lng=${coords.lng}&district=${encodeURIComponent(district)}`, {
      // 위치 기반 개인화 조회라 캐시하지 않는다.
      cache: "no-store",
    });
    if (!res.ok) return getFallbackNearbyStores(district);
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return getFallbackNearbyStores(district);

    const parsed: NearbyStore[] = [];
    for (const entry of data) {
      if (
        entry &&
        typeof entry === "object" &&
        typeof (entry as Record<string, unknown>).id === "string" &&
        typeof (entry as Record<string, unknown>).name === "string" &&
        typeof (entry as Record<string, unknown>).category === "string" &&
        typeof (entry as Record<string, unknown>).distanceM === "number"
      ) {
        parsed.push(entry as NearbyStore);
      }
    }
    return parsed.length > 0 ? parsed : getFallbackNearbyStores(district);
  } catch {
    return getFallbackNearbyStores(district);
  }
}
