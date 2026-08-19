// 카카오 로컬 키워드 검색(청과·채소가게·과일가게·마트) — 반경 내 검색 후 거리순 정렬.
//
// `app/api/nearby-stores/route.ts`(클라 인터랙션용 BFF 표면)와 F04-3 판매 장소 선택
// Server Component(`app/report/place/page.tsx`)가 이 함수를 함께 쓴다 — RSC는 자기 자신의
// Route Handler를 HTTP로 되부르지 않고 서버 함수를 직접 호출한다(`api-patterns` 3층 규칙).
//
// KAKAO_REST_KEY는 여기(서버)까지만 — 클라이언트 번들에 절대 노출하지 않는다.
// 키 미설정·업스트림 실패·응답 파싱 실패는 전부 결정적 더미로 폴백한다(`_lib/nearby-stores.ts`).
//
// 반환 모양은 `StoreRequest`다 — 제보 제출(`POST .../reports`)에 그대로 실을 수 있게
// 카카오 문서를 여기서 한 번만 매핑한다.

import "server-only";

import { getFallbackNearbyStores, type NearbyStore } from "./nearby-stores";
import { storeRequestSchema, type StoreRequest } from "./api/schemas/reports";

const KEYWORDS = ["청과", "채소가게", "과일가게", "마트"];
const RADIUS_M = 2000;
const RESULT_LIMIT = 8;

interface KakaoKeywordDoc {
  id?: string;
  place_name?: string;
  address_name?: string;
  road_address_name?: string;
  category_name?: string;
  category_group_code?: string;
  category_group_name?: string;
  phone?: string;
  place_url?: string;
  distance?: string;
  /** 경도(문자열) — StoreRequest.x와 순서가 같다. */
  x?: string;
  /** 위도(문자열) — StoreRequest.y와 순서가 같다. */
  y?: string;
}

interface KakaoKeywordResponse {
  documents?: KakaoKeywordDoc[];
}

async function searchKeyword(
  keyword: string,
  lat: number,
  lng: number,
  key: string,
): Promise<KakaoKeywordDoc[]> {
  const upstream = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  upstream.searchParams.set("query", keyword);
  upstream.searchParams.set("x", String(lng));
  upstream.searchParams.set("y", String(lat));
  upstream.searchParams.set("radius", String(RADIUS_M));
  upstream.searchParams.set("sort", "distance");
  const res = await fetch(upstream, {
    headers: { Authorization: `KakaoAK ${key}` },
    // 위치 기반 개인화 조회 — 캐시하지 않는다.
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as KakaoKeywordResponse;
  return Array.isArray(data.documents) ? data.documents : [];
}

/** 카카오 문서 하나 → 제보 제출용 StoreRequest. 필수 필드가 빠졌으면 버린다. */
function toStoreRequest(doc: KakaoKeywordDoc): StoreRequest | null {
  const distance = doc.distance !== undefined ? Number(doc.distance) : undefined;
  const x = doc.x !== undefined ? Number(doc.x) : undefined;
  const y = doc.y !== undefined ? Number(doc.y) : undefined;

  const parsed = storeRequestSchema.safeParse({
    id: doc.id,
    placeName: doc.place_name,
    addressName: doc.address_name,
    roadAddressName: doc.road_address_name || undefined,
    categoryName: doc.category_name || undefined,
    categoryGroupCode: doc.category_group_code || undefined,
    categoryGroupName: doc.category_group_name || undefined,
    phone: doc.phone || undefined,
    placeUrl: doc.place_url || undefined,
    x: Number.isFinite(x) ? x : undefined,
    y: Number.isFinite(y) ? y : undefined,
    distance: Number.isFinite(distance) ? Math.round(distance as number) : undefined,
  });
  return parsed.success ? parsed.data : null;
}

/**
 * 폴백 더미(id·name·category·distanceM)를 StoreRequest로 맞춘다.
 *
 * 실주소를 모르므로 동 이름만으로 합성한다. 예전 `report/_data.ts`의 더미는
 * "서울 강남구 ${district}"처럼 지역과 무관하게 "강남구"를 박아 놓고 있었다 — 그 버그를
 * 반복하지 않도록 지역명만 쓴다.
 */
function toFallbackStore(store: NearbyStore, district: string): StoreRequest {
  return {
    id: store.id,
    placeName: store.name,
    addressName: district ? `서울 ${district} 인근` : "주소 정보 없음",
    categoryName: store.category,
    distance: store.distanceM,
  };
}

/**
 * 청과·채소가게·과일가게·마트 카카오 키워드 검색. 실패·키 미설정·좌표 없음은 전부
 * 결정적 더미로 폴백한다 — 이 함수는 던지지 않는다(호출부가 에러 상태를 따로 만들 필요 없음).
 */
export async function searchNearbyStorePlaces(params: {
  lat: number;
  lng: number;
  district: string;
}): Promise<StoreRequest[]> {
  const { lat, lng, district } = params;
  const key = process.env.KAKAO_REST_KEY;

  if (!key || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return getFallbackNearbyStores(district).map((store) => toFallbackStore(store, district));
  }

  try {
    const results = await Promise.all(KEYWORDS.map((kw) => searchKeyword(kw, lat, lng, key)));
    const seen = new Set<string>();
    const stores: StoreRequest[] = [];

    for (const doc of results.flat()) {
      const store = toStoreRequest(doc);
      if (!store || seen.has(store.id)) continue;
      seen.add(store.id);
      stores.push(store);
    }

    if (stores.length === 0) {
      return getFallbackNearbyStores(district).map((store) => toFallbackStore(store, district));
    }

    stores.sort((a, b) => (a.distance ?? RADIUS_M) - (b.distance ?? RADIUS_M));
    return stores.slice(0, RESULT_LIMIT);
  } catch {
    return getFallbackNearbyStores(district).map((store) => toFallbackStore(store, district));
  }
}
