// 가게 위치 선택(F04-1) 더미 — GPS 반경 + Kakao 키워드 검색(category_name에 "청과"·"채소"·"과일" 포함) 실연결 전 폴백.
// 실연결 시 이 함수만 BFF(app/api/nearby-stores) 호출로 교체하면 화면은 그대로 동작.

export interface NearbyStore {
  id: string;
  /** 가게명 */
  name: string;
  /** Kakao category_name 세부 계층(예: "과일,채소가게") */
  category: string;
  /** 대략 거리(m) — 정렬용 */
  distanceM: number;
}

/** 자치구별 결정적 더미 목록(임의값 아님 — 매 렌더 동일 결과). */
const DUMMY_STORES: Record<string, NearbyStore[]> = {
  강남구: [
    { id: "s1", name: "우리농산물가락직판장", category: "과일,채소가게", distanceM: 120 },
    { id: "s2", name: "행복청과", category: "과일,채소가게", distanceM: 210 },
    { id: "s3", name: "이마트 강남점", category: "대형마트", distanceM: 480 },
  ],
};

const FALLBACK_STORES: NearbyStore[] = [
  { id: "f1", name: "동네청과", category: "과일,채소가게", distanceM: 150 },
  { id: "f2", name: "행복마트", category: "대형마트", distanceM: 300 },
];

/** GPS 좌표 + 자치구로 근처 청과·마트 목록을 가져온다. Kakao API 키 미설정 시 더미로 폴백. */
export async function getNearbyStores(district: string): Promise<NearbyStore[]> {
  // TODO(✍️): KAKAO_REST_KEY 설정 시 app/api/nearby-stores(BFF)로 교체 — 키워드 검색(청과·채소·과일) + 반경.
  return DUMMY_STORES[district] ?? FALLBACK_STORES;
}
