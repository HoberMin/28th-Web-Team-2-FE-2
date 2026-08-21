"use client";

import { useEffect, useRef, useState } from "react";
import {
  getStoreDetailAPI,
  getStoreRecentReportsAPI,
  StoresClientError,
} from "@/app/_lib/api/client/stores";
import type { StoreDetail, StoreReports } from "@/app/_lib/api/schemas/stores";
import type { MapCenter } from "./_data";

/** Figma `section/recent-report`가 "최근 제보"에 요구하는 개수(product-spec.md F03-2). */
export const RECENT_REPORT_COUNT = 2;

export type StoreSheetDetailStatus = "loading" | "success" | "error";

export interface StoreSheetDetailState {
  status: StoreSheetDetailStatus;
  detail: StoreDetail | null;
  reports: StoreReports | null;
  error: string | null;
  /**
   * 응답이 도착한 시각(ms epoch). `resolveRecentReportDateVariant`의 "오늘" 기준값 —
   * 렌더 중에 `Date.now()`를 직접 부르면 impure render 규칙(react-hooks/purity)에 걸려서,
   * 딱 한 번 fetch가 끝나는 시점(`.then()` 콜백)에만 값을 만들어 상태에 담아 둔다.
   */
  fetchedAt: number | null;
}

interface StoreSheetDetailInternalState extends StoreSheetDetailState {
  /** 이 상태가 어느 storeId의 결과인지. 요청한 storeId와 다르면 아직 로딩 중이다. */
  key: string | null;
}

const LOADING_STATE: StoreSheetDetailState = {
  status: "loading",
  detail: null,
  reports: null,
  error: null,
  fetchedAt: null,
};

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/**
 * 지도 마커를 눌러 시트가 열릴 때 가게 상세 + 최근 제보를 함께 부른다.
 *
 * `center`는 지도 현재 중심이다 — 사용자 실제 좌표가 아니지만, 근처 가게 검색 자체가 이미
 * 이 중심 기준이라 거리·도보시간 계산에 같은 기준을 쓰는 게 일관적이다. **선택 시점의 중심
 * 하나만 쓴다** — ref로 최신값을 들고 있다가 storeId가 바뀔 때 그 순간 값을 스냅샷으로
 * 쓴다. `center`를 fetch effect의 의존성에 넣으면, 시트가 열린 채로 지도를 드래그할 때마다
 * (같은 가게를 보는 중에도) 상세·제보를 다시 부르게 된다.
 *
 * `state.key`로 "지금 값이 요청한 storeId의 것인가"를 판정해서 로딩 여부를 **파생**한다 —
 * effect 안에서 로딩 전환을 위해 setState를 동기 호출하지 않으려는 것이다
 * (`useNearbyStores`/`_nearby-state.ts`와 같은 이유 — react-hooks/set-state-in-effect).
 */
export function useStoreSheetDetail(storeId: string, center: MapCenter): StoreSheetDetailState {
  const centerRef = useRef(center);
  useEffect(() => {
    centerRef.current = center;
  });

  const [state, setState] = useState<StoreSheetDetailInternalState>({
    key: null,
    ...LOADING_STATE,
  });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const numericStoreId = Number(storeId);
    const { lat, lng } = centerRef.current;

    Promise.all([
      getStoreDetailAPI(numericStoreId, { latitude: lat, longitude: lng }, controller.signal),
      getStoreRecentReportsAPI(numericStoreId, RECENT_REPORT_COUNT, controller.signal),
    ])
      .then(([detail, reports]) => {
        if (!active) return;
        setState({
          key: storeId,
          status: "success",
          detail,
          reports,
          error: null,
          fetchedAt: Date.now(),
        });
      })
      .catch((error: unknown) => {
        if (!active || isAbortError(error)) return;
        const message =
          error instanceof StoresClientError ? error.message : "가게 정보를 불러오지 못했어요.";
        setState({
          key: storeId,
          status: "error",
          detail: null,
          reports: null,
          error: message,
          fetchedAt: null,
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [storeId]);

  if (state.key !== storeId) return LOADING_STATE;
  return state;
}
