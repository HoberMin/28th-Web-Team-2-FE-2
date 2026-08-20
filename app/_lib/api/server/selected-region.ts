import "server-only";

import { cookies } from "next/headers";
import {
  hasRegionCoordinates,
  locatedRegionSchema,
  regionCoordinatesSchema,
  regionSchema,
  resolveRegionSelection,
  type LocatedRegion,
  type Region,
} from "../schemas/regions";
import { searchRegions } from "./regions";

const REGION_ID_COOKIE = "mg_region_id";
const REGION_NAME_COOKIE = "mg_region_name";
const REGION_LATITUDE_COOKIE = "mg_region_latitude";
const REGION_LONGITUDE_COOKIE = "mg_region_longitude";

// 기존 localStorage 선택값처럼 재방문에도 유지하되, 브라우저 쿠키 상한보다 짧게 둔다.
const REGION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const REGION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: REGION_COOKIE_MAX_AGE,
} as const;

/** Route Handler·Server Action에서 선택 지역을 RSC가 읽을 수 있는 쿠키로 보존한다. */
export async function saveSelectedRegion(region: LocatedRegion): Promise<void> {
  const parsed = locatedRegionSchema.parse(region);
  const store = await cookies();
  store.set(REGION_ID_COOKIE, parsed.regionId, REGION_COOKIE_OPTIONS);
  store.set(REGION_NAME_COOKIE, parsed.regionName, REGION_COOKIE_OPTIONS);
  store.set(REGION_LATITUDE_COOKIE, String(parsed.latitude), REGION_COOKIE_OPTIONS);
  store.set(REGION_LONGITUDE_COOKIE, String(parsed.longitude), REGION_COOKIE_OPTIONS);
}

/** Items RSC 등 서버 소비자가 선택 지역 id와 표시 이름을 함께 읽는 단일 진입점. */
export async function getSelectedRegion(): Promise<Region | null> {
  const store = await cookies();
  const identity = regionSchema.safeParse({
    regionId: store.get(REGION_ID_COOKIE)?.value,
    regionName: store.get(REGION_NAME_COOKIE)?.value,
  });
  if (!identity.success) return null;

  const latitude = store.get(REGION_LATITUDE_COOKIE)?.value;
  const longitude = store.get(REGION_LONGITUDE_COOKIE)?.value;
  if (latitude === undefined || longitude === undefined) return identity.data;
  if (!latitude.trim() || !longitude.trim()) return identity.data;

  const coordinates = regionCoordinatesSchema.safeParse({
    latitude: Number(latitude),
    longitude: Number(longitude),
  });
  return coordinates.success ? { ...identity.data, ...coordinates.data } : identity.data;
}

export async function getSelectedRegionId(): Promise<string | null> {
  return (await getSelectedRegion())?.regionId ?? null;
}

/** 선택 지역에 좌표가 없으면 이름으로 재검색하되, 동일한 법정동 코드의 결과만 사용한다. */
export async function resolveSelectedRegionCoordinates(
  selected: Region,
): Promise<LocatedRegion | null> {
  if (hasRegionCoordinates(selected)) return selected;

  const keyword = selected.regionName.trim();
  if (!keyword) return null;

  return resolveRegionSelection(selected, await searchRegions(keyword));
}

/**
 * 선택 지역을 주변 가게 조회에 안전한 좌표 포함 상태로 좁힌다.
 * 좌표 없는 기존 쿠키는 동일 regionId 검색 결과로 복구하고, 복구한 좌표를 다시 저장한다.
 */
export async function getVerifiedSelectedRegion(): Promise<LocatedRegion | null> {
  const selected = await getSelectedRegion();
  if (!selected) return null;

  const resolved = await resolveSelectedRegionCoordinates(selected);
  if (!resolved) return null;
  if (!hasRegionCoordinates(selected)) {
    await saveSelectedRegion(resolved);
  }
  return resolved;
}
