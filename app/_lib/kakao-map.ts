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

export interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void;
  setLevel(level: number): void;
}

export interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void;
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
    addListener(target: KakaoMap, type: "click", handler: () => void): void;
    removeListener(target: KakaoMap, type: "click", handler: () => void): void;
  };
  load(callback: () => void): void;
}

export interface KakaoGlobal {
  maps: KakaoMapsApi;
}

const SDK_ID = "kakao-maps-sdk";

/** SDK를 한 번만 심고, 이후 호출은 이미 로드된 전역을 돌려준다. 실패·키 없음은 모두 null. */
export function loadKakaoSdk(appKey: string | undefined): Promise<KakaoGlobal | null> {
  if (!appKey) return Promise.resolve(null);

  return new Promise((resolve) => {
    const existing = (window as unknown as { kakao?: KakaoGlobal }).kakao;
    if (existing?.maps) {
      existing.maps.load(() => resolve(existing));
      return;
    }
    // 같은 스크립트를 화면마다 다시 넣지 않는다 — 태그가 이미 있으면 로드 완료만 기다린다.
    const prior = document.getElementById(SDK_ID) as HTMLScriptElement | null;
    const script = prior ?? document.createElement("script");
    const onLoad = () => {
      const kakao = (window as unknown as { kakao?: KakaoGlobal }).kakao;
      if (kakao?.maps) kakao.maps.load(() => resolve(kakao));
      else resolve(null);
    };
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", () => resolve(null), { once: true });
    if (!prior) {
      script.id = SDK_ID;
      script.async = true;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
      document.head.appendChild(script);
    }
  });
}

export type MapLoadStatus = "idle" | "loading" | "ready" | "failed";
