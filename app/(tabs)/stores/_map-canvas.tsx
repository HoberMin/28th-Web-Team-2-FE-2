"use client";

import { useEffect, useRef, useState } from "react";
import { loadKakaoSdk, type MapLoadStatus } from "@/app/_lib/kakao-map";

// F03 가게 탭의 지역 배지가 광진구로 고정돼 있으므로 지도도 같은 지역 중심에서 시작한다.
// 실가게 API가 붙으면 사용자 좌표와 응답 마커 범위에 맞춰 center/level을 갱신한다.
const GWANGJIN_CENTER = { lat: 37.5384, lng: 127.0822 } as const;

/**
 * 카카오 지도 캔버스.
 *
 * 지도는 화면 전체를 채우고 검색·필터·마커·바텀시트는 `_map-view.tsx`가 위에 겹친다.
 * JavaScript 키가 없거나 SDK 로드가 실패해도 컨트롤 영역은 유지하고 실패 안내만 표시한다.
 */
export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<MapLoadStatus>("idle");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    setStatus("loading");

    void loadKakaoSdk(process.env.NEXT_PUBLIC_KAKAO_JS_KEY)
      .then((kakao) => {
        if (cancelled) return;
        if (!kakao) {
          setStatus("failed");
          return;
        }

        const center = new kakao.maps.LatLng(GWANGJIN_CENTER.lat, GWANGJIN_CENTER.lng);
        new kakao.maps.Map(container, { center, level: 4 });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 bg-surface-secondary">
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
  );
}
