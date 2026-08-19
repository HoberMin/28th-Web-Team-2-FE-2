"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadKakaoSdk,
  type KakaoMap,
  type MapLoadStatus,
} from "@/app/_lib/kakao-map";

interface ReportPlaceMapProps {
  center: { lat: number; lng: number };
  level?: number;
}

/** F04-3 지도 밴드 — 판매 장소 목록 시트 뒤에서 카카오 지도를 렌더링한다. */
export function ReportPlaceMap({ center, level = 5 }: ReportPlaceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const [status, setStatus] = useState<MapLoadStatus>("idle");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let map: KakaoMap | null = null;
    setStatus("loading");

    void loadKakaoSdk(process.env.NEXT_PUBLIC_KAKAO_JS_KEY)
      .then((kakao) => {
        if (cancelled) return;
        if (!kakao) {
          setStatus("failed");
          return;
        }

        const mapCenter = new kakao.maps.LatLng(center.lat, center.lng);
        map = new kakao.maps.Map(container, { center: mapCenter, level });
        mapRef.current = map;
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
      mapRef.current = null;
      container.replaceChildren();
    };
  }, [center.lat, center.lng, level]);

  return (
    // z-0으로 별도 stacking context를 만든다 — 카카오 SDK가 내부 DOM(타일·컨트롤)에
    // 자체 z-index를 붙이는데, 이 래퍼가 명시적 z-index로 새 stacking context를 열지
    // 않으면 그 값들이 형제 엘리먼트(마커·시트, z-index 미지정)와 같은 층에서 비교돼
    // 지도가 위로 튀어나올 수 있다(실제로 이 증상이 신고됐다).
    <div className="absolute inset-0 z-0 bg-surface-secondary">
      <div ref={containerRef} className="absolute inset-0" />
      {status !== "ready" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-secondary">
          <p className="text-body-14-regular text-content-disabled">
            {status === "failed" ? "지도를 불러오지 못했어요" : "지도 준비 중"}
          </p>
        </div>
      ) : null}
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
    </div>
  );
}
