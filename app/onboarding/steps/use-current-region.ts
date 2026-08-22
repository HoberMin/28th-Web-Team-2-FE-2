"use client";

import { useCallback, useEffect, useState } from "react";
import { BrowserLocationError, getCurrentCoordinates } from "@/app/_lib/api/client/browser-location";
import { getNearbyRegionsAPI, RegionClientError } from "@/app/_lib/api/client/regions";
import { FALLBACK_REGION } from "@/app/_lib/api/fixed-region";
import type { Region } from "@/app/_lib/api/schemas/regions";

/**
 * 현재 위치로 동네 하나를 확정하는 훅.
 *
 * 2026-08-22 온보딩 전환: 지역 단계가 "검색 + 후보 목록"에서 **"탐색 → 확인/아니요"**로 바뀌어
 * 사용자가 목록에서 고르는 단계가 없다. 그래서 이 훅은 후보 배열이 아니라 **동네 하나**를 돌려준다.
 *
 * ⚠️ 사용자 좌표를 후보에 얹는 이유는 이전 구현(`use-region-options.ts`)과 같다 —
 * `/regions/nearby`는 좌표를 돌려주지 않아서, 좌표 없이 선택하면 `POST /api/regions/selection`이
 * 동 이름으로 Spring 재검색을 돌게 되고 그 `/regions/search`가 후보 다건 검색어에서 502를 낸다
 * (`농산물-문서/be-검토-2026-08-21.md` §1). 좌표를 얹으면 재검색 자체가 일어나지 않는다.
 * BE가 좌표를 함께 내려주면 `...region`이 뒤에 오므로 그쪽 값이 자동으로 우선한다.
 */

export type CurrentRegionStatus = "idle" | "detecting" | "confirming";

export interface CurrentRegionState {
  status: CurrentRegionStatus;
  /** `confirming`에서만 채워진다. */
  region: Region | null;
  /** 위치 확인에 실패해 `FALLBACK_REGION`으로 대체했으면 그 사유 문구, 아니면 빈 문자열. */
  fallbackReason: string;
}

/**
 * 형식적 로딩 최소 노출 시간.
 *
 * 좌표·근처 동네가 즉시 오면 "탐색 중" 화면이 한 프레임만 번쩍이고 사라져서, 사용자에게는
 * 아무 절차 없이 동네가 정해진 것처럼 보인다. "지금 계신 동네를 탐색 중이에요"를 최소 이만큼은
 * 보여 준다. 실제 조회가 더 오래 걸리면 그때까지 기다린다(둘 중 늦은 쪽).
 */
export const REGION_DETECT_MIN_MS = 1_200;

function fallbackReasonOf(error: unknown): string {
  if (error instanceof BrowserLocationError) {
    return error.kind === "denied"
      ? "위치 권한이 꺼져 있어 기본 동네로 시작할게요."
      : "현재 위치를 확인하지 못해 기본 동네로 시작할게요.";
  }
  if (error instanceof RegionClientError) {
    return "동네 정보를 불러오지 못해 기본 동네로 시작할게요.";
  }
  return "현재 위치를 확인하지 못해 기본 동네로 시작할게요.";
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      resolve();
    });
  });
}

interface UseCurrentRegionOptions {
  /** false면 탐색을 시작하지 않고 `idle`로 남는다(마이페이지처럼 버튼을 눌러야 시작하는 화면). */
  enabled?: boolean;
}

export function useCurrentRegionDetection({ enabled = true }: UseCurrentRegionOptions = {}): {
  state: CurrentRegionState;
  /** 「아니요, 여기가 아니에요」 — 로딩부터 다시 탐색한다. */
  redetect: () => void;
} {
  const [attempt, setAttempt] = useState(enabled ? 1 : 0);
  const [state, setState] = useState<CurrentRegionState>({
    status: enabled ? "detecting" : "idle",
    region: null,
    fallbackReason: "",
  });

  const redetect = useCallback(() => {
    setState({ status: "detecting", region: null, fallbackReason: "" });
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    if (attempt === 0) return;

    let active = true;
    const controller = new AbortController();

    async function detect() {
      const paced = delay(REGION_DETECT_MIN_MS, controller.signal);
      let region: Region = FALLBACK_REGION;
      let fallbackReason = "";

      try {
        const coordinates = await getCurrentCoordinates();
        const regions = await getNearbyRegionsAPI(coordinates, controller.signal);
        const nearest = regions.at(0);
        if (nearest) {
          region = { ...coordinates, ...nearest };
        } else {
          fallbackReason = "현재 위치 근처의 동네를 찾지 못해 기본 동네로 시작할게요.";
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        fallbackReason = fallbackReasonOf(error);
      }

      await paced;
      if (!active) return;
      setState({ status: "confirming", region, fallbackReason });
    }

    void detect();
    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  return { state, redetect };
}

/** 「공덕동이 맞나요?」처럼 표시할 짧은 동 이름. Spring은 전체 법정동 이름을 내려준다. */
export function districtNameOf(region: Region): string {
  return region.regionName.trim().split(/\s+/).at(-1) ?? region.regionName;
}
