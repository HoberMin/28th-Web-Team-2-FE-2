// 법정동 검색·조회
//
// ⚠️ 함정 둘 (`backend-api-reference` §2):
//  1. `/regions/search`만 `{code, message, data}` envelope를 쓴다. 다른 엔드포인트는 안 쓴다.
//  2. `regionId`가 여기서는 string("0111010100"), `/regions/nearby`에서는 int64로 갈린다.
//     숫자로 다루면 앞자리 0이 사라지므로 **프론트는 string으로 통일**한다.

import { z } from "zod";

/** 법정동 코드 자릿수. 스펙 예시가 양쪽 다 10자리다(`"0111010100"` / `4413310500`). */
const REGION_ID_LENGTH = 10;

export const REGION_SEARCH_MIN_LENGTH = 2;
export const REGION_SEARCH_MAX_LENGTH = 20;

/**
 * 앞자리 0이 있는 코드값이라 항상 문자열로 다룬다.
 *
 * `/regions/nearby`는 이 값을 int64로 주는데, 서울(`0`으로 시작) 코드는 그 시점에 이미
 * 앞자리 0이 잘려 9자리로 온다. 자릿수가 10으로 고정이라 `padStart`로 복원한다 —
 * 안 하면 `/items?regionId=`에 9자리를 넘겨 **조용히 빈 목록**이 된다.
 *
 * 라이브 OpenAPI의 문자열 regionId는 `\d{10}`으로 확정되어 있다.
 * `/regions/nearby`가 문자열로 통일되면 이 복원 자체가 필요 없어진다.
 */
export const regionIdSchema = z.union([
  // 문자열로 주는 엔드포인트는 OpenAPI대로 정확히 10자리만 받는다.
  z.string().regex(/^\d{10}$/, {
    message: `법정동 코드는 숫자 ${REGION_ID_LENGTH}자리여야 합니다.`,
  }),
  // `/regions/nearby`만 int64라 서울 코드의 맨 앞 0이 사라진 9자리 숫자가 올 수 있다.
  z
    .number()
    .int()
    .safe()
    .refine((value) => /^\d{9,10}$/.test(String(value)), {
      message: `법정동 코드는 숫자 ${REGION_ID_LENGTH}자리여야 합니다.`,
    })
    .transform((value) => String(value).padStart(REGION_ID_LENGTH, "0")),
]);

export const regionSchema = z.object({
  regionId: regionIdSchema,
  regionName: z.string(),
});
export type Region = z.infer<typeof regionSchema>;

function districtName(regionName: string): string {
  const parts = regionName.trim().split(/\s+/);
  return parts.at(-1) ?? regionName;
}

/**
 * 쿠키를 id/name 두 개로 보존하던 기존 버전에서 남은 불일치를 Spring 검색 결과로 복구한다.
 * id와 동명이 모두 맞는 결과를 우선하고, 이름만 맞는 경우는 후보가 하나일 때만 id를 복구한다.
 */
export function resolveRegionSelection(selected: Region, candidates: Region[]): Region | null {
  const selectedDistrict = districtName(selected.regionName);
  const matchingPair = candidates.find(
    (candidate) =>
      candidate.regionId === selected.regionId && districtName(candidate.regionName) === selectedDistrict,
  );
  if (matchingPair) return matchingPair;

  const exactNameMatches = candidates.filter(
    (candidate) => candidate.regionName.trim() === selected.regionName.trim(),
  );
  if (exactNameMatches.length === 1) return exactNameMatches[0] ?? null;

  const districtMatches = candidates.filter(
    (candidate) => districtName(candidate.regionName) === selectedDistrict,
  );
  return districtMatches.length === 1 ? (districtMatches[0] ?? null) : null;
}

/** `RegionSearchRequest` — 실제 쿼리 키는 springdoc 표기의 `request`가 아니라 `keyword`다. */
export const regionSearchRequestSchema = z.object({
  keyword: z
    .string()
    .trim()
    .min(REGION_SEARCH_MIN_LENGTH)
    .max(REGION_SEARCH_MAX_LENGTH)
    .regex(/^[가-힣]+(?: [가-힣]+)*$/),
});

/** `NearbyRegionRequest` — 위·경도 범위는 WGS84의 유효 범위다. */
export const nearbyRegionRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/** `/regions/search` 전용 envelope — 이 엔드포인트에만 있다. */
export const regionSearchEnvelopeSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  data: z.object({ searchResults: z.array(regionSchema) }),
});

/** `/regions/nearby`는 최상위 배열을 그대로 준다. */
export const nearbyRegionsSchema = z.array(regionSchema);

// GET/POST /api/v1/users/me/regions·PUT .../current — 로그인 사용자의 "관심 지역" 계열.
//
// ⚠️ 위 `regionSchema`(regionId/regionName만)를 재사용하지 않는다 — `/regions/search`·
// `/regions/nearby`가 이미 그 스키마를 쓰고 있어서, 여기서 필드를 더하면 그쪽 계약까지
// 흔들린다(`api-patterns` "공통 unwrap 유틸을 만들지 않는다"와 같은 이유: 모양이 다르면
// 스키마도 따로 둔다).

/** 관심 지역 하나 — 목록 조회에서 현재 선택 여부(`isCurrent`)까지 함께 온다. */
export const userRegionSchema = z.object({
  regionId: regionIdSchema,
  regionName: z.string(),
  isCurrent: z.boolean(),
});
export type UserRegion = z.infer<typeof userRegionSchema>;

/** GET /api/v1/users/me/regions 응답. */
export const userRegionsResponseSchema = z.object({
  regions: z.array(userRegionSchema),
});

/** POST /api/v1/users/me/regions 요청 바디. */
export const addUserRegionRequestSchema = z.object({
  regionId: regionIdSchema,
});
export type AddUserRegionRequest = z.infer<typeof addUserRegionRequestSchema>;
