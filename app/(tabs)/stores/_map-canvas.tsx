"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadKakaoSdk,
  type KakaoMap,
  type KakaoMapsApi,
  type MapLoadStatus,
} from "@/app/_lib/kakao-map";
import type { MapCenter } from "./_data";
import type { MapScreenPoint, MapScreenSize } from "./_cluster";

const INITIAL_MAP_LEVEL = 5;
// Kakao level은 숫자가 클수록 축소다. Figma의 축소 상태(level 5)를 기본값으로 사용해
// 화면에서 2km 반경을 벗어난 동네가 섞이지 않도록 한다.
const MAX_MAP_LEVEL = 5;

export interface MapCanvasStorePosition {
  id: string;
  lat: number;
  lng: number;
  /** SDK 실패 시에도 기존 Figma 더미 위치를 표시하기 위한 화면 퍼센트 좌표. */
  x: number;
  y: number;
}

export interface MapViewport {
  level: number;
  center: MapCenter;
  size: MapScreenSize;
  points: Readonly<Record<string, MapScreenPoint>>;
}

export interface MapFocusRequest {
  lat: number;
  lng: number;
  level: number;
}

/**
 * 카카오 지도 캔버스.
 *
 * 지도는 `_map-view.tsx`가 정한 지도 영역을 채우고 필터·마커·바텀시트가 위에 겹친다.
 * JavaScript 키가 없거나 SDK 로드가 실패해도 컨트롤 영역은 유지하고 실패 안내만 표시한다.
 */
export interface MapCanvasProps {
  initialCenter: MapCenter;
  stores: readonly MapCanvasStorePosition[];
  onMapClick?: () => void;
  onViewportChange?: (viewport: MapViewport) => void;
  focusRequest?: MapFocusRequest | null;
}

export function MapCanvas({
  initialCenter,
  stores,
  onMapClick,
  onViewportChange,
  focusRequest,
}: MapCanvasProps) {
  const { lat: initialLat, lng: initialLng } = initialCenter;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const kakaoMapsRef = useRef<KakaoMapsApi | null>(null);
  const storesRef = useRef(stores);
  const refreshViewportRef = useRef<(() => void) | null>(null);
  const onViewportChangeRef = useRef(onViewportChange);
  const [status, setStatus] = useState<MapLoadStatus>("idle");

  useEffect(() => {
    onViewportChangeRef.current = onViewportChange;
  }, [onViewportChange]);

  useEffect(() => {
    storesRef.current = stores;
    const refreshViewport = refreshViewportRef.current;
    if (refreshViewport) {
      refreshViewport();
      return;
    }

    const container = containerRef.current;
    if (!container) return;
    const points: Record<string, MapScreenPoint> = {};
    for (const store of stores) {
      points[store.id] = {
        x: (container.clientWidth * store.x) / 100,
        y: (container.clientHeight * store.y) / 100,
      };
    }
    onViewportChangeRef.current?.({
      level: INITIAL_MAP_LEVEL,
      center: { lat: initialLat, lng: initialLng },
      size: { width: container.clientWidth, height: container.clientHeight },
      points,
    });
  }, [initialLat, initialLng, stores]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let kakaoMaps: KakaoMapsApi | null = null;
    let map: KakaoMap | null = null;
    let updateViewport: (() => void) | null = null;
    setStatus("loading");

    const fallbackPoints: Record<string, MapScreenPoint> = {};
    for (const store of storesRef.current) {
      fallbackPoints[store.id] = {
        x: (container.clientWidth * store.x) / 100,
        y: (container.clientHeight * store.y) / 100,
      };
    }
    onViewportChangeRef.current?.({
      level: INITIAL_MAP_LEVEL,
      center: { lat: initialLat, lng: initialLng },
      size: { width: container.clientWidth, height: container.clientHeight },
      points: fallbackPoints,
    });

    void loadKakaoSdk(process.env.NEXT_PUBLIC_KAKAO_JS_KEY)
      .then((kakao) => {
        if (cancelled) return;
        if (!kakao) {
          setStatus("failed");
          return;
        }

        const center = new kakao.maps.LatLng(initialLat, initialLng);
        kakaoMaps = kakao.maps;
        map = new kakao.maps.Map(container, { center, level: INITIAL_MAP_LEVEL });
        mapRef.current = map;
        kakaoMapsRef.current = kakao.maps;

        updateViewport = () => {
          if (!map || !kakaoMaps) return;
          if (map.getLevel() > MAX_MAP_LEVEL) {
            map.setLevel(MAX_MAP_LEVEL);
            return;
          }
          const projection = map.getProjection();
          const points: Record<string, MapScreenPoint> = {};
          for (const store of storesRef.current) {
            const coordinate = new kakaoMaps.LatLng(store.lat, store.lng);
            const point = projection.containerPointFromCoords(coordinate);
            points[store.id] = { x: point.x, y: point.y };
          }
          const center = map.getCenter();
          onViewportChangeRef.current?.({
            level: map.getLevel(),
            center: { lat: center.getLat(), lng: center.getLng() },
            size: { width: container.clientWidth, height: container.clientHeight },
            points,
          });
        };
        refreshViewportRef.current = updateViewport;

        if (onMapClick) kakao.maps.event.addListener(map, "click", onMapClick);
        kakao.maps.event.addListener(map, "idle", updateViewport);
        updateViewport();
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
      if (map && kakaoMaps && onMapClick) {
        kakaoMaps.event.removeListener(map, "click", onMapClick);
      }
      if (map && kakaoMaps && updateViewport) {
        kakaoMaps.event.removeListener(map, "idle", updateViewport);
      }
      mapRef.current = null;
      kakaoMapsRef.current = null;
      refreshViewportRef.current = null;
      container.replaceChildren();
    };
  }, [initialLat, initialLng, onMapClick]);

  useEffect(() => {
    const map = mapRef.current;
    const kakaoMaps = kakaoMapsRef.current;
    if (!map || !kakaoMaps || !focusRequest) return;

    const center = new kakaoMaps.LatLng(focusRequest.lat, focusRequest.lng);
    map.setCenter(center);
    map.setLevel(focusRequest.level, {
      anchor: center,
      animate: { duration: 300 },
    });
  }, [focusRequest, status]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={status === "ready" ? undefined : onMapClick}
        // overflow-hidden: UI QA 2026-08-20 #16 "가게 원형 아이콘이 지도 영역 밖으로 튀어나옴".
        // 마커는 Kakao SDK가 CustomOverlay로 그리는데, 지도 가장자리에 걸친 마커는 컨테이너
        // 경계를 넘어 그려진다(오버레이는 지도 div 기준 절대 위치라 clip되지 않는다).
        // 래퍼에서 잘라 지도 영역 밖으로 새지 않게 한다.
        className="absolute inset-0 overflow-hidden bg-surface-secondary"
      >
        <div ref={containerRef} className="absolute inset-0" />

        {status !== "ready" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-secondary">
            <p className="text-body-14-regular text-content-disabled">
              {status === "failed" ? "지도를 불러오지 못했어요" : "지도 준비 중"}
            </p>
          </div>
        ) : null}

        {status === "ready" ? (
          <span className="absolute top-1/2 left-1/2 flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-surface-primary bg-blue-500 shadow-floating" />
        ) : null}
      </div>
      {status === "loading" ? (
        <p role="status" aria-atomic="true" className="sr-only">
          지도 준비 중
        </p>
      ) : null}
      {status === "failed" ? (
        <p role="alert" aria-atomic="true" className="sr-only">
          지도를 불러오지 못했어요
        </p>
      ) : null}
    </>
  );
}
