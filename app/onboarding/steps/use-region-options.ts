"use client";

import { useEffect, useState } from "react";
import { getCurrentCoordinates, BrowserLocationError } from "@/app/_lib/api/client/browser-location";
import {
  canSearchRegions,
  getNearbyRegionsAPI,
  REGION_SEARCH_DEBOUNCE_MS,
  RegionClientError,
  searchRegionsAPI,
} from "@/app/_lib/api/client/regions";
import { REGION_SEARCH_MIN_LENGTH, type Region } from "@/app/_lib/api/schemas/regions";

export type RegionOptionsStatus = "idle" | "loading" | "success" | "empty" | "error";

export interface RegionOptionsState {
  status: RegionOptionsStatus;
  regions: Region[];
  message: string;
}

const INITIAL_SEARCH_STATE: RegionOptionsState = {
  status: "idle",
  regions: [],
  message: "",
};

interface RegionSearchState extends RegionOptionsState {
  keyword: string;
}

const INITIAL_NEARBY_STATE: RegionOptionsState = {
  status: "loading",
  regions: [],
  message: "현재 위치로 근처 동네를 찾고 있어요.",
};

function failedMessage(error: unknown): string {
  if (error instanceof RegionClientError || error instanceof BrowserLocationError) {
    return error.message;
  }
  return "동네를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";
}

export function useRegionSearchOptions(query: string): RegionOptionsState {
  const keyword = query.trim();
  const validKeyword = canSearchRegions(keyword);
  const [state, setState] = useState<RegionSearchState>({
    ...INITIAL_SEARCH_STATE,
    keyword: "",
  });

  useEffect(() => {
    if (!validKeyword) return;

    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setState({
        keyword,
        status: "loading",
        regions: [],
        message: "동네를 검색하고 있어요.",
      });
      try {
        const regions = await searchRegionsAPI(keyword, controller.signal);
        if (!active) return;
        setState({
          keyword,
          status: regions.length > 0 ? "success" : "empty",
          regions,
          message: regions.length > 0 ? "" : "검색 결과가 없어요.",
        });
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        setState({ keyword, status: "error", regions: [], message: failedMessage(error) });
      }
    }, REGION_SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [keyword, validKeyword]);

  if (!keyword) return INITIAL_SEARCH_STATE;
  if (keyword.length < REGION_SEARCH_MIN_LENGTH) {
    return {
      status: "idle",
      regions: [],
      message: "동 이름을 두 글자 이상 입력해 주세요.",
    };
  }
  if (!validKeyword) {
    return { status: "error", regions: [], message: "한글 동 이름을 입력해 주세요." };
  }
  return state.keyword === keyword ? state : INITIAL_SEARCH_STATE;
}

/**
 * 현재 위치 기준 동네 후보.
 *
 * ⚠️ `/regions/nearby`는 `/regions/search`와 달리 **좌표를 돌려주지 않는다**. 좌표가 없는 채로
 * 선택하면 `POST /api/regions/selection`이 동 이름으로 Spring 재검색을 돌게 되는데,
 * 그 `/regions/search`가 후보 다건 검색어에서 502를 낸다(`농산물-문서/be-검토-2026-08-21.md` §1).
 * 그래서 조회에 쓴 사용자 좌표를 후보에 얹어 **재검색 자체가 일어나지 않게** 한다.
 *
 * 얹는 값은 동 중심이 아니라 사용자 위치다. 이 좌표의 용도가 주변 가게 조회라 오히려 더
 * 적합하고, `/regions/nearby`는 보통 좌표가 속한 동 하나를 돌려준다. BE가 좌표를 함께
 * 내려주면(§4) `...region`이 뒤에 오므로 그쪽 값이 자동으로 우선한다.
 */
export function useNearbyRegionOptions(): RegionOptionsState {
  const [state, setState] = useState<RegionOptionsState>(INITIAL_NEARBY_STATE);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function loadNearbyRegions() {
      try {
        const coordinates = await getCurrentCoordinates();
        const regions = await getNearbyRegionsAPI(coordinates, controller.signal);
        if (!active) return;
        setState({
          status: regions.length > 0 ? "success" : "empty",
          regions: regions.map((region) => ({ ...coordinates, ...region })),
          message: regions.length > 0 ? "" : "현재 위치 근처의 동네를 찾지 못했어요.",
        });
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        setState({ status: "error", regions: [], message: failedMessage(error) });
      }
    }

    void loadNearbyRegions();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return state;
}
