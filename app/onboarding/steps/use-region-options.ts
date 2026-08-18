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
  const [state, setState] = useState<RegionOptionsState>(INITIAL_SEARCH_STATE);

  useEffect(() => {
    const keyword = query.trim();
    if (!keyword) {
      setState(INITIAL_SEARCH_STATE);
      return;
    }
    if (keyword.length < REGION_SEARCH_MIN_LENGTH) {
      setState({
        status: "idle",
        regions: [],
        message: "동 이름을 두 글자 이상 입력해 주세요.",
      });
      return;
    }
    if (!canSearchRegions(keyword)) {
      setState({
        status: "error",
        regions: [],
        message: "한글 동 이름을 입력해 주세요.",
      });
      return;
    }

    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setState({ status: "loading", regions: [], message: "동네를 검색하고 있어요." });
      try {
        const regions = await searchRegionsAPI(keyword, controller.signal);
        if (!active) return;
        setState({
          status: regions.length > 0 ? "success" : "empty",
          regions,
          message: regions.length > 0 ? "" : "검색 결과가 없어요.",
        });
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        setState({ status: "error", regions: [], message: failedMessage(error) });
      }
    }, REGION_SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return state;
}

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
          regions,
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
