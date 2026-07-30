"use client";

import { useEffect, useRef, useState } from "react";
import IconLocationpinLine from "@karrotmarket/react-monochrome-icon/IconLocationpinLine";
import { useCurrentCoords } from "../_lib/location";
import {
  distanceMeters,
  formatDistance,
  getStoreLocation,
  walkMinutes,
} from "../_lib/store-locations";

// 가게 위치 — "여기 어디야?"에 답한다.
//
// 가격이 싸도 세 정거장 밖이면 안 간다. 절약액과 발걸음을 같이 보여줘야 판단이 서고,
// 그 선택은 사용자 몫이다(가까운 데를 강요하지도, 싼 데만 밀지도 않는다).
//
// 지도는 Kakao Maps JS SDK로 그린다. JS 앱키(NEXT_PUBLIC_KAKAO_JS_KEY)가 없는 환경에서는
// 지도 캔버스 없이 거리·주소만 남긴다 — 키가 없다고 화면이 깨지거나 비지 않게.

interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}
interface KakaoMapsApi {
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => unknown;
  Marker: new (options: { position: KakaoLatLng; map: unknown }) => unknown;
  load(callback: () => void): void;
}
interface KakaoGlobal {
  maps: KakaoMapsApi;
}

const SDK_ID = "kakao-maps-sdk";

function loadKakaoSdk(appKey: string): Promise<KakaoGlobal | null> {
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

export function StoreMap({ storeName, district }: { storeName: string; district: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const coords = useCurrentCoords();
  const location = getStoreLocation(storeName, district);
  const meters = distanceMeters(coords, location);
  const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

  useEffect(() => {
    if (!appKey || !containerRef.current) return;
    let cancelled = false;

    loadKakaoSdk(appKey).then((kakao) => {
      if (cancelled || !kakao || !containerRef.current) return;
      const center = new kakao.maps.LatLng(location.lat, location.lng);
      const map = new kakao.maps.Map(containerRef.current, { center, level: 4 });
      new kakao.maps.Marker({ position: center, map });
      setMapReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [appKey, location.lat, location.lng]);

  return (
    <section aria-label="가게 위치" className="flex flex-col gap-2">
      <h2 className="text-head2-16 text-fg-neutral">위치</h2>

      {/* 지도는 보조 표현이다 — 위치의 실제 정보(주소·거리·도보 시간)는 아래 텍스트가 전달한다.
          화면 낭독기에는 지도 캔버스 대신 그 텍스트가 읽히는 게 맞다. */}
      {appKey && (
        <div
          ref={containerRef}
          aria-hidden="true"
          className="h-40 w-full overflow-hidden rounded-2xl bg-bg-neutral-weak"
        />
      )}
      {/* 키는 있는데 SDK가 안 뜬 경우(도메인 미등록·네트워크)에도 아래 정보로 위치는 읽힌다 */}
      {appKey && !mapReady && (
        <p className="sr-only" role="status">
          지도를 불러오는 중이에요
        </p>
      )}

      <div className="flex items-center gap-2 rounded-2xl bg-bg-neutral-weak px-4 py-3">
        <span className="shrink-0 text-fg-neutral-muted [&_svg]:size-5" aria-hidden="true">
          <IconLocationpinLine />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-14-medium text-fg-neutral">{location.address}</span>
          <span className="text-caption-12-regular tabular-nums text-fg-neutral-muted">
            내 위치에서 {formatDistance(meters)} · 걸어서 {walkMinutes(meters)}분
          </span>
        </span>
      </div>
    </section>
  );
}
