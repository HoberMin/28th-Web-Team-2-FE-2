"use client";

import { useEffect, useState } from "react";
import {
  getNearbyStoresAPI,
  STORES_QUERY_DEBOUNCE_MS,
  StoresClientError,
} from "@/app/_lib/api/client/stores";
import { mapNearbyStoreToMapStore, type MapCenter, type MapStore } from "./_data";
import {
  createNearbyStoresRequestKey,
  shouldFetchNearbyStores,
  type NearbyStoresState,
  type NearbyStoresStatus,
} from "./_nearby-state";

export interface UseNearbyStoresParams {
  center: MapCenter;
  radius: number;
  keyword: string;
  onlyLiked: boolean;
  initialState: NearbyStoresState;
}

export interface UseNearbyStoresResult {
  stores: MapStore[];
  status: NearbyStoresStatus;
  error: string | null;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useNearbyStores({
  center,
  radius,
  keyword,
  onlyLiked,
  initialState,
}: UseNearbyStoresParams): UseNearbyStoresResult {
  const { lat, lng } = center;
  const normalizedKeyword = keyword.trim();
  const requestKey = createNearbyStoresRequestKey({ center, radius, keyword, onlyLiked });
  const [state, setState] = useState<NearbyStoresState>(initialState);

  useEffect(() => {
    if (!shouldFetchNearbyStores(state.key, requestKey)) return;

    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void getNearbyStoresAPI(
        {
          latitude: lat,
          longitude: lng,
          radius,
          keyword: normalizedKeyword || undefined,
          onlyLiked,
        },
        controller.signal,
      )
        .then((result) => {
          if (!active) return;
          setState({
            key: requestKey,
            stores: result.stores.map((store) =>
              mapNearbyStoreToMapStore(store, { lat, lng }, radius),
            ),
            status: "success",
            error: null,
          });
        })
        .catch((error: unknown) => {
          if (!active || isAbortError(error)) return;
          const message =
            error instanceof StoresClientError
              ? error.status === 401 && onlyLiked
                ? "찜한 가게는 로그인 후 볼 수 있어요."
                : error.message
              : "주변 가게를 불러오지 못했어요.";
          setState({ key: requestKey, stores: [], status: "error", error: message });
        });
    }, STORES_QUERY_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [lat, lng, normalizedKeyword, onlyLiked, radius, requestKey, state.key]);

  if (state.key !== requestKey) {
    return { stores: [], status: "loading", error: null };
  }
  return { stores: state.stores, status: state.status, error: state.error };
}
