"use client";

import {
  locatedRegionSchema,
  locatedRegionsSchema,
  nearbyRegionsSchema,
  regionSchema,
  regionSearchRequestSchema,
  type LocatedRegion,
  type Region,
} from "../schemas/regions";

export const REGION_SEARCH_DEBOUNCE_MS = 300;

export class RegionClientError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "RegionClientError";
    this.status = status;
  }
}

function messageOf(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null || !("message" in payload)) return null;
  return typeof payload.message === "string" ? payload.message : null;
}

async function responseError(response: Response): Promise<RegionClientError> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return new RegionClientError(
    response.status,
    messageOf(payload) ?? "동네를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
  );
}

async function readRegionsPayload(response: Response): Promise<unknown> {
  if (!response.ok) throw await responseError(response);

  try {
    return await response.json();
  } catch {
    throw new RegionClientError(502, "동네 응답을 읽지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
}

function parseNearbyRegions(payload: unknown): Region[] {
  const parsed = nearbyRegionsSchema.safeParse(payload);
  if (!parsed.success) {
    throw new RegionClientError(502, "동네 응답이 올바르지 않아요. 잠시 후 다시 시도해 주세요.");
  }
  return parsed.data;
}

function parseSearchRegions(payload: unknown): LocatedRegion[] {
  const parsed = locatedRegionsSchema.safeParse(payload);
  if (!parsed.success) {
    throw new RegionClientError(502, "동네 좌표를 확인하지 못했어요. 동네를 다시 선택해 주세요.");
  }
  return parsed.data;
}

export function canSearchRegions(keyword: string): boolean {
  return regionSearchRequestSchema.safeParse({ keyword }).success;
}

export async function searchRegionsAPI(
  keyword: string,
  signal?: AbortSignal,
): Promise<LocatedRegion[]> {
  const parsed = regionSearchRequestSchema.safeParse({ keyword });
  if (!parsed.success) {
    throw new RegionClientError(400, "한글 동 이름을 두 글자 이상 입력해 주세요.");
  }

  const params = new URLSearchParams({ keyword: parsed.data.keyword });
  const response = await fetch(`/api/regions/search?${params.toString()}`, {
    cache: "no-store",
    signal,
  });
  return parseSearchRegions(await readRegionsPayload(response));
}

export async function getNearbyRegionsAPI(
  coordinates: { latitude: number; longitude: number },
  signal?: AbortSignal,
): Promise<Region[]> {
  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
  });
  const response = await fetch(`/api/regions/nearby?${params.toString()}`, {
    cache: "no-store",
    signal,
  });
  return parseNearbyRegions(await readRegionsPayload(response));
}

export async function saveSelectedRegionAPI(region: Region): Promise<LocatedRegion> {
  const parsed = regionSchema.safeParse(region);
  if (!parsed.success) {
    throw new RegionClientError(400, "선택한 동네 정보가 올바르지 않아요.");
  }

  const response = await fetch("/api/regions/selection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });
  if (!response.ok) throw await responseError(response);

  try {
    return locatedRegionSchema.parse(await response.json());
  } catch {
    throw new RegionClientError(502, "선택한 동네 좌표를 저장하지 못했어요. 동네를 다시 선택해 주세요.");
  }
}

/**
 * 로그인 사용자의 관심 지역으로 Spring에 등록 + 현재 지역으로 지정한다.
 *
 * `saveSelectedRegionAPI`(쿠키 저장)와는 별개다 — 그쪽은 비회원도 쓰는 "지금 보는 지역"
 * 로컬 저장소이고, 이건 계정에 귀속되는 서버 상태다. 온보딩 지역 단계처럼 **로그인이 확정된
 * 화면에서만** 부른다(비로그인 상태로 부르면 BFF가 401을 던진다).
 *
 * 이미 등록된 지역(409)은 실패로 취급하지 않는다 — 재방문자가 같은 동네를 다시 고르는 경우라
 * "현재 지역 지정"만 마저 하면 된다.
 */
export async function registerCurrentRegionAPI(region: Region): Promise<void> {
  const addResponse = await fetch("/api/regions/me", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ regionId: region.regionId }),
    cache: "no-store",
  });
  if (!addResponse.ok && addResponse.status !== 409) {
    throw await responseError(addResponse);
  }

  const currentResponse = await fetch(`/api/regions/me/${region.regionId}/current`, {
    method: "PUT",
    cache: "no-store",
  });
  if (!currentResponse.ok) throw await responseError(currentResponse);
}
