"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { MarkerStoreMap } from "@/app/_components/marker-store-map";
import { ASSADA_MART_IMAGE_PATH, ASSADA_MART_STORE } from "@/app/_lib/assada-mart";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import type { StoreRequest } from "@/app/_lib/api/schemas/reports";
import {
  loadKakaoSdk,
  type KakaoGlobal,
  type KakaoMap,
  type MapLoadStatus,
} from "@/app/_lib/kakao-map";
import {
  KakaoPlacesClientError,
  searchNearbyStorePlacesWithSdk,
} from "@/app/_lib/kakao-places-client";
import { ROUTES } from "@/app/_lib/routes";
import { formatDistance } from "@/app/_lib/store-locations";
import { RowStoreOption } from "../_components/row-store-option";

type PlacesStatus = "idle" | "loading" | "success" | "failed";

interface MarkerPosition {
  place: StoreRequest;
  left: number;
  top: number;
}

interface ReportPlaceMapProps {
  center: { lat: number; lng: number } | null;
  item?: string;
  /** 폼에서 입력 중이던 가격·양 — 장소를 골라 `/report`로 돌아갈 때 그대로 실어 보낸다. */
  price?: string;
  amount?: string;
  unavailableMessage?: string;
  level?: number;
}

/**
 * F04-3 지도와 장소 목록.
 * 지도 타일과 장소 검색 모두 테스트 앱의 JavaScript 키로 로드한 Maps SDK를 사용한다.
 */
export function ReportPlaceMap({
  center,
  item,
  price,
  amount,
  unavailableMessage,
  level = 5,
}: ReportPlaceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const kakaoRef = useRef<KakaoGlobal | null>(null);
  const [mapStatus, setMapStatus] = useState<MapLoadStatus>("idle");
  const [placesStatus, setPlacesStatus] = useState<PlacesStatus>("idle");
  const [places, setPlaces] = useState<StoreRequest[]>([]);
  const [markerPositions, setMarkerPositions] = useState<MarkerPosition[]>([]);
  const placesRef = useRef<StoreRequest[]>([]);
  const cleanupSearchRef = useRef<(() => void) | null>(null);

  const repositionMarkers = useCallback(() => {
    const map = mapRef.current;
    const kakao = kakaoRef.current;
    if (!map || !kakao) return;

    const projection = map.getProjection();
    const nextPositions = placesRef.current.flatMap((place) => {
      if (place.x === undefined || place.y === undefined) return [];
      const point = projection.containerPointFromCoords(
        new kakao.maps.LatLng(place.y as number, place.x as number),
      );
      return [{ place, left: point.x, top: point.y }];
    });
    setMarkerPositions(nextPositions);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !center) return;

    let cancelled = false;
    setMapStatus("loading");
    setPlacesStatus("loading");
    setPlaces([ASSADA_MART_STORE]);

    void loadKakaoSdk(process.env.NEXT_PUBLIC_KAKAO_JS_KEY)
      .then(async (kakao) => {
        if (cancelled) return;
        if (!kakao) {
          setMapStatus("failed");
          setPlacesStatus("failed");
          return;
        }

        const mapCenter = new kakao.maps.LatLng(center.lat, center.lng);
        const map = new kakao.maps.Map(container, { center: mapCenter, level });
        kakaoRef.current = kakao;
        mapRef.current = map;
        setMapStatus("ready");

        let searchTimer: ReturnType<typeof setTimeout> | undefined;
        const searchPlaces = () => {
          if (searchTimer) clearTimeout(searchTimer);
          repositionMarkers();
          searchTimer = setTimeout(async () => {
            if (cancelled) return;
            setPlacesStatus("loading");
            try {
              const currentCenter = map.getCenter();
              const nextPlaces = await searchNearbyStorePlacesWithSdk({
                kakao,
                center: { lat: currentCenter.getLat(), lng: currentCenter.getLng() },
              });
              if (cancelled) return;
              const placesWithImages = await Promise.all(
                nextPlaces.map(async (place) => {
                  if (!place.placeUrl) return place;
                  try {
                    const response = await fetch(
                      `/api/places/metadata?url=${encodeURIComponent(place.placeUrl)}`,
                      { cache: "no-store" },
                    );
                    if (!response.ok) return place;
                    const metadata: unknown = await response.json();
                    const imageUrl =
                      typeof metadata === "object" && metadata !== null && "imageUrl" in metadata
                        ? Reflect.get(metadata, "imageUrl")
                        : undefined;
                    return typeof imageUrl === "string" && imageUrl.length > 0
                      ? { ...place, imageUrl }
                      : place;
                  } catch {
                    return place;
                  }
                }),
              );
              if (cancelled) return;
              placesRef.current = placesWithImages;
              setPlaces(placesWithImages);
              setPlacesStatus("success");
            } catch (error) {
              if (!(error instanceof KakaoPlacesClientError)) throw error;
              if (!cancelled) setPlacesStatus("failed");
            }
          }, 250);
        };

        kakao.maps.event.addListener(map, "idle", searchPlaces);
        searchPlaces();

        const cleanupSearch = () => {
          if (searchTimer) clearTimeout(searchTimer);
          kakao.maps.event.removeListener(map, "idle", searchPlaces);
        };
        cleanupSearchRef.current = cleanupSearch;
      })
      .catch(() => {
        if (cancelled) return;
        setMapStatus("failed");
        setPlacesStatus("failed");
      });

    return () => {
      cancelled = true;
      cleanupSearchRef.current?.();
      cleanupSearchRef.current = null;
      placesRef.current = [];
      setMarkerPositions([]);
      kakaoRef.current = null;
      mapRef.current = null;
      container.replaceChildren();
    };
  }, [center, level, repositionMarkers]);

  useEffect(() => {
    placesRef.current = places;
    repositionMarkers();
  }, [places, repositionMarkers]);

  function hrefFor(store: StoreRequest): string {
    const params = new URLSearchParams();
    if (item) params.set("item", item);
    if (price) params.set("price", price);
    if (amount) params.set("amount", amount);
    params.set("store", JSON.stringify(store));
    return `${ROUTES.report}?${params.toString()}`;
  }

  const placesMessage = unavailableMessage
    ? unavailableMessage
    : placesStatus === "loading" || placesStatus === "idle"
      ? "주변 가게를 찾고 있어요."
      : placesStatus === "failed"
        ? "가게 검색을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
        : places.length === 0
          ? "선택한 동네 주변에 제보 가능한 가게가 없어요."
          : null;

  return (
    <div className="relative mt-4.25 min-h-0 flex-1 overflow-hidden bg-surface-secondary">
      <div className="absolute inset-0 z-0 bg-surface-secondary">
        <div ref={containerRef} className="absolute inset-0" />
        {!center || mapStatus !== "ready" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-secondary">
            <p className="text-body-14-regular text-content-disabled">
              {!center || mapStatus === "failed" ? "지도를 불러오지 못했어요" : "지도 준비 중"}
            </p>
          </div>
        ) : null}
      </div>

      {markerPositions.map(({ place, left, top }) => {
        return (
          <Link
            key={place.id}
            href={hrefFor(place)}
            aria-label={`${place.placeName} 선택`}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left, top }}
          >
            <MarkerStoreMap
              label={place.placeName}
              icon={<FigmaIcon name="store-fill-marker-24" width={24} />}
            />
          </Link>
        );
      })}

      {/*
        max-h-1/2: 목록이 길면 시트가 지도를 다 가리던 문제(2026-08-21 버그 리포트) — 시트
        높이를 지도 영역의 절반으로 캡하고, 그 이상은 아래 overflow-y-auto가 스크롤시킨다.
        (원래 Figma 실측은 h649 고정값이지만, 사용자 지시로 반응형 절반 캡으로 바꿨다.)
      */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 flex max-h-1/2 flex-col rounded-t-3xl bg-surface-primary px-4 pb-5 pt-7"
        style={{ boxShadow: "0px -4px 6px 0px rgba(74, 86, 103, 0.2)" }}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {placesMessage ? (
            <p
              className="px-4 py-8 text-center text-body-14-regular text-content-secondary"
              role="status"
            >
              {placesMessage}
            </p>
          ) : (
            <ul className="flex w-full flex-col items-start">
              {places.map((place) => (
                <li key={place.id} className="w-full">
                  <RowStoreOption
                    name={place.placeName}
                    distance={formatDistance(place.distance ?? 0)}
                    address={place.roadAddressName || place.addressName}
                    href={hrefFor(place)}
                    thumbnail={
                      place.imageUrl || place.id === ASSADA_MART_STORE.id ? (
                        <Image
                          src={place.imageUrl || ASSADA_MART_IMAGE_PATH}
                          alt=""
                          width={56}
                          height={56}
                          unoptimized
                          className="size-full object-cover"
                        />
                      ) : (
                        <FigmaImage
                          name="store-thumbnail.png"
                          width={56}
                          height={56}
                          className="size-full object-cover"
                        />
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
