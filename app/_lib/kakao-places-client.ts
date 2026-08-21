import { storeRequestSchema, type StoreRequest } from "./api/schemas/reports";
import type {
  KakaoGlobal,
  KakaoPlaceSearchResult,
  KakaoServicesApi,
} from "./kakao-map";

const KEYWORDS = ["청과", "채소가게", "과일가게", "마트"];
const RADIUS_METERS = 500;
const RESULT_LIMIT = 8;

export class KakaoPlacesClientError extends Error {
  constructor() {
    super("카카오 장소 검색을 사용할 수 없어요.");
    this.name = "KakaoPlacesClientError";
  }
}

function mapPlace(result: KakaoPlaceSearchResult): StoreRequest | null {
  const distance = result.distance === undefined ? undefined : Number(result.distance);
  const x = result.x === undefined ? undefined : Number(result.x);
  const y = result.y === undefined ? undefined : Number(result.y);
  const parsed = storeRequestSchema.safeParse({
    id: result.id,
    placeName: result.place_name,
    addressName: result.address_name,
    roadAddressName: result.road_address_name || undefined,
    categoryName: result.category_name || undefined,
    categoryGroupCode: result.category_group_code || undefined,
    categoryGroupName: result.category_group_name || undefined,
    phone: result.phone || undefined,
    placeUrl: result.place_url || undefined,
    x: Number.isFinite(x) ? x : undefined,
    y: Number.isFinite(y) ? y : undefined,
    distance: Number.isFinite(distance) ? Math.round(distance as number) : undefined,
  });
  return parsed.success ? parsed.data : null;
}

function searchKeyword(params: {
  kakao: KakaoGlobal;
  services: KakaoServicesApi;
  keyword: string;
  center: { lat: number; lng: number };
}): Promise<KakaoPlaceSearchResult[]> {
  const { kakao, services, keyword, center } = params;
  return new Promise((resolve, reject) => {
    const places = new services.Places();
    places.keywordSearch(
      keyword,
      (results, status) => {
        if (status === services.Status.OK) {
          resolve(results);
          return;
        }
        if (status === services.Status.ZERO_RESULT) {
          resolve([]);
          return;
        }
        reject(new KakaoPlacesClientError());
      },
      {
        location: new kakao.maps.LatLng(center.lat, center.lng),
        radius: RADIUS_METERS,
        size: 15,
        sort: services.SortBy.DISTANCE,
      },
    );
  });
}

/** 테스트 앱 JavaScript 키로 로드한 Kakao Maps services 라이브러리에서 장소를 검색한다. */
export async function searchNearbyStorePlacesWithSdk(params: {
  kakao: KakaoGlobal;
  center: { lat: number; lng: number };
}): Promise<StoreRequest[]> {
  const services = params.kakao.maps.services;
  if (!services) throw new KakaoPlacesClientError();

  const results = await Promise.all(
    KEYWORDS.map((keyword) =>
      searchKeyword({ kakao: params.kakao, services, keyword, center: params.center }),
    ),
  );
  const seen = new Set<string>();
  const stores: StoreRequest[] = [];

  for (const result of results.flat()) {
    const store = mapPlace(result);
    if (!store || seen.has(store.id)) continue;
    seen.add(store.id);
    stores.push(store);
  }

  stores.sort((a, b) => (a.distance ?? RADIUS_METERS) - (b.distance ?? RADIUS_METERS));
  return stores.slice(0, RESULT_LIMIT);
}
