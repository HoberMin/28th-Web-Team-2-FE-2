import "server-only";

import { cookies } from "next/headers";
import { regionSchema, resolveRegionSelection, type Region } from "../schemas/regions";
import { searchRegions } from "./regions";

const REGION_ID_COOKIE = "mg_region_id";
const REGION_NAME_COOKIE = "mg_region_name";

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
export async function saveSelectedRegion(region: Region): Promise<void> {
  const parsed = regionSchema.parse(region);
  const store = await cookies();
  store.set(REGION_ID_COOKIE, parsed.regionId, REGION_COOKIE_OPTIONS);
  store.set(REGION_NAME_COOKIE, parsed.regionName, REGION_COOKIE_OPTIONS);
}

/** Items RSC 등 서버 소비자가 선택 지역 id와 표시 이름을 함께 읽는 단일 진입점. */
export async function getSelectedRegion(): Promise<Region | null> {
  const store = await cookies();
  const parsed = regionSchema.safeParse({
    regionId: store.get(REGION_ID_COOKIE)?.value,
    regionName: store.get(REGION_NAME_COOKIE)?.value,
  });
  return parsed.success ? parsed.data : null;
}

export async function getSelectedRegionId(): Promise<string | null> {
  return (await getSelectedRegion())?.regionId ?? null;
}

/**
 * 선택 지역의 이름과 id 쌍을 Spring 법정동 검색으로 검증한다.
 * 기존 쿠키가 불일치하면 이름으로 후보를 하나로 확정할 수 있을 때만 자동 복구한다.
 */
export async function getVerifiedSelectedRegion(): Promise<Region | null> {
  const selected = await getSelectedRegion();
  if (!selected) return null;

  const keyword = selected.regionName.trim().split(/\s+/).at(-1);
  if (!keyword) return null;

  const resolved = resolveRegionSelection(selected, await searchRegions(keyword));
  if (!resolved) return null;
  if (resolved.regionId !== selected.regionId || resolved.regionName !== selected.regionName) {
    await saveSelectedRegion(resolved);
  }
  return resolved;
}
