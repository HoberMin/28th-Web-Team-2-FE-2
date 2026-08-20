"use client";

// Kakao Maps JS SDK 로더 — 가게 상세(F09)의 작은 지도와 가게 탭(F07)의 전체 화면 지도가 공유한다.
//
// 앱키(NEXT_PUBLIC_KAKAO_JS_KEY)는 도메인 제한이 걸리는 공개 키라 클라이언트 노출이 정상이다
// (시크릿 아님 — conventions #7의 대상이 아니다). 키가 없거나 로드가 실패하면 `null`을 돌려주고,
// 화면은 각자 폴백(회색 박스 / 목록)으로 넘어간다. 지도 없이도 정보는 전달돼야 한다.

export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

export interface KakaoPoint {
  x: number;
  y: number;
}

export interface KakaoMapProjection {
  containerPointFromCoords(latlng: KakaoLatLng): KakaoPoint;
}

export interface KakaoSetLevelOptions {
  anchor?: KakaoLatLng;
  animate?: boolean | { duration: number };
}

export interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void;
  setLevel(level: number, options?: KakaoSetLevelOptions): void;
  getCenter(): KakaoLatLng;
  getLevel(): number;
  getProjection(): KakaoMapProjection;
}

export interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void;
}

export interface KakaoPlaceSearchResult {
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
  x?: string;
  y?: string;
}

export interface KakaoKeywordSearchOptions {
  location: KakaoLatLng;
  radius: number;
  size: number;
  sort: string;
}

export interface KakaoPlacesService {
  keywordSearch(
    keyword: string,
    callback: (results: KakaoPlaceSearchResult[], status: string) => void,
    options: KakaoKeywordSearchOptions,
  ): void;
}

export interface KakaoServicesApi {
  Places: new () => KakaoPlacesService;
  SortBy: { DISTANCE: string };
  Status: { OK: string; ZERO_RESULT: string; ERROR: string };
}

export interface KakaoMapsApi {
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
  Marker: new (options: { position: KakaoLatLng; map: KakaoMap }) => unknown;
  CustomOverlay: new (options: {
    position: KakaoLatLng;
    content: HTMLElement | string;
    map?: KakaoMap;
    yAnchor?: number;
    clickable?: boolean;
  }) => KakaoCustomOverlay;
  event: {
    addListener(target: KakaoMap, type: "click" | "idle", handler: () => void): void;
    removeListener(target: KakaoMap, type: "click" | "idle", handler: () => void): void;
  };
  services?: KakaoServicesApi;
  load(callback: () => void): void;
}

export interface KakaoGlobal {
  maps: KakaoMapsApi;
}

const SDK_ID = "kakao-maps-sdk";
let pendingSdkLoad: Promise<KakaoGlobal | null> | null = null;

/** SDK를 한 번만 심고, 이후 호출은 이미 로드된 전역을 돌려준다. 실패·키 없음은 모두 null. */
export function loadKakaoSdk(appKey: string | undefined): Promise<KakaoGlobal | null> {
  const existing = (window as unknown as { kakao?: KakaoGlobal }).kakao;
  if (existing?.maps) {
    return new Promise((resolve) => existing.maps.load(() => resolve(existing)));
  }
  if (!appKey) return Promise.resolve(null);
  if (pendingSdkLoad) return pendingSdkLoad;

  // 전 호출이 load/error 이후 전역 없이 끝났다면 남은 태그는 이미 이벤트가 끝난 상태다.
  // 거기에 listener를 다시 달면 영원히 호출되지 않으므로 제거하고 새 요청을 시작한다.
  const prior = document.getElementById(SDK_ID);
  prior?.remove();

  const script = document.createElement("script");
  pendingSdkLoad = new Promise((resolve) => {
    let settled = false;
    const settle = (result: KakaoGlobal | null) => {
      if (settled) return;
      settled = true;
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      if (!result) script.remove();
      pendingSdkLoad = null;
      resolve(result);
    };
    const onLoad = () => {
      const kakao = (window as unknown as { kakao?: KakaoGlobal }).kakao;
      if (!kakao?.maps) {
        settle(null);
        return;
      }

      try {
        kakao.maps.load(() => settle(kakao));
      } catch {
        settle(null);
      }
    };
    const onError = () => settle(null);

    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    script.id = SDK_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    document.head.appendChild(script);
  });
  return pendingSdkLoad;
}

export type MapLoadStatus = "idle" | "loading" | "ready" | "failed";
