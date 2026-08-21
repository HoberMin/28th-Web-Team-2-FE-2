// GET /api/v1/stores/nearby — 지도 중심 주변 가게

import { z } from "zod";

/** 지도에서 조회할 수 있는 최대 반경. 백엔드 기본 반경과 맞춰 2km로 조회한다. */
export const MAX_NEARBY_STORE_RADIUS = 2000;
export const DEFAULT_NEARBY_STORE_RADIUS = MAX_NEARBY_STORE_RADIUS;

const optionalKeywordSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const booleanQuerySchema = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean());

const requiredNumberQuerySchema = z.preprocess(
  (value) => {
    if (value === null) return undefined;
    if (typeof value === "string" && value.trim() === "") return undefined;
    return value;
  },
  z.coerce.number().finite(),
);

export const nearbyStoresRequestSchema = z.object({
  latitude: requiredNumberQuerySchema.pipe(z.number().min(-90).max(90)),
  longitude: requiredNumberQuerySchema.pipe(z.number().min(-180).max(180)),
  radius: z.coerce
    .number()
    .int()
    .min(0)
    // API 계약의 상한은 유지하되, 실제 지도 화면은 MAX_NEARBY_STORE_RADIUS만 사용한다.
    .max(5000)
    .default(DEFAULT_NEARBY_STORE_RADIUS),
  onlyLiked: booleanQuerySchema.default(false),
  keyword: optionalKeywordSchema,
});
export type NearbyStoresRequest = z.infer<typeof nearbyStoresRequestSchema>;

export const nearbyStoreSchema = z.object({
  storeId: z.number().int().safe(),
  storeName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  addressName: z.string().optional(),
  roadAddressName: z.string().optional(),
  phone: z.string().optional(),
  placeUrl: z.string().optional(),
  distanceMeters: z.number().optional(),
  /**
   * 로그인 사용자의 단골 여부 — 개인화 필드다(공유 캐시 금지).
   * items와 같은 이유로 없거나 null이면 false로 본다(BE 요청 3번 대기).
   */
  isLiked: z.boolean().nullish().transform((value) => value ?? false),
});
export type NearbyStore = z.infer<typeof nearbyStoreSchema>;

export const nearbyStoresSchema = z.object({
  totalCount: z.number(),
  stores: z.array(nearbyStoreSchema),
});
export type NearbyStores = z.infer<typeof nearbyStoresSchema>;

// Spring 응답이 {code, message, data}로 감싸져 있다 — 다른 엔드포인트와 envelope 형태가
// 달라서(backend-api-reference §2) items.ts의 itemPageEnvelopeSchema와 같은 패턴을 쓴다.
export const nearbyStoresEnvelopeSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  data: nearbyStoresSchema,
});

// ── GET /api/v1/users/me/favorite-stores — 단골 가게 (스펙 태그: My Page) ────────────
//
// nearby와 필드가 겹치지 않는다. 좌표 대신 거리·영업 상태·오늘 영업시간을 주고, 대신
// 위경도가 없어 지도에 찍을 수 없다. 공통 타입으로 합치지 않는 이유다.

export const favoriteStoreSchema = z.object({
  storeId: z.number().int().safe(),
  storeName: z.string(),
  storeImageUrl: z.string().nullish(),
  distanceMeters: z.number().nullish(),
  /**
   * 스펙이 `type: string`으로만 선언하고 enum이 없다 — 실제로 어떤 값이 오는지 확인되지 않아
   * 문자열 그대로 받는다. 화면은 `_saved-store-view.ts`에서 "영업중" 여부만 판정한다.
   */
  openStatus: z.string().nullish(),
  todayBusinessHours: z.string().nullish(),
  /** 단골 목록이므로 항상 true여야 하지만, 스펙에 있는 필드라 그대로 받는다. */
  isLiked: z.boolean().nullish().transform((value) => value ?? true),
});
export type FavoriteStore = z.infer<typeof favoriteStoreSchema>;

export const favoriteStoresSchema = z.object({
  stores: z.array(favoriteStoreSchema),
  page: z.number().int().nullish(),
  size: z.number().int().nullish(),
  totalElements: z.number().int().nullish(),
  totalPages: z.number().int().nullish(),
  hasNext: z.boolean().nullish().transform((value) => value ?? false),
});
export type FavoriteStores = z.infer<typeof favoriteStoresSchema>;

export const favoriteStoresEnvelopeSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  data: favoriteStoresSchema,
});

// ── GET /api/v1/stores/{storeId}/reports — 가게별 가격 제보 ──────────────────────────

export const STORE_REPORT_FILTERS = ["ALL", "CHEAP", "EXPENSIVE"] as const;
export type StoreReportFilter = (typeof STORE_REPORT_FILTERS)[number];

export const PRICE_CLASSIFICATIONS = ["CHEAP", "EXPENSIVE", "EQUAL"] as const;
export type PriceClassification = (typeof PRICE_CLASSIFICATIONS)[number];

/**
 * 제보자 등급 · 프로필 색.
 *
 * ⚠️ **아직 백엔드 스펙에 없다** (2026-08-21 `/v3/api-docs` 재조회 확인 —
 *    `StoreReportResponse`는 reportId·itemId·itemName·itemImageUrl·price·unit·
 *    reportedDate·publicPriceDiff·priceDiffRate·priceClassification 10개뿐이다).
 *    Figma `row/saved type=photo`(1096:19281)가 제보 행마다 아바타·닉네임·등급 배지를
 *    요구해서, **필드가 생길 때까지 nullable로 받아 두고 화면은 "제보자 정보 없음"을 그린다.**
 *
 *    아래 이름·enum 값은 **프론트 제안이고 합의 전이다(가설)** —
 *    `농산물-문서/be-요청-2026-08-21-가게상세-제보행.md` 1번에서 확정한다.
 *    실제 응답 키가 다르게 정해지면 여기만 고치면 화면은 그대로 동작한다.
 */
export const REPORTER_RANKS = ["SPROUT", "ROOKIE", "EXPERT", "KING"] as const;
export type ReporterRankCode = (typeof REPORTER_RANKS)[number];

export const REPORTER_PROFILE_COLORS = ["GREEN", "BLUE", "ORANGE", "GRAY"] as const;
export type ReporterProfileColorCode = (typeof REPORTER_PROFILE_COLORS)[number];

/** 모르는 값은 `null`로 떨어뜨린다 — 등급이 늘어나도 화면이 죽지 않는다. */
const reporterRankSchema = z
  .string()
  .nullish()
  .transform((value): ReporterRankCode | null =>
    REPORTER_RANKS.includes(value as ReporterRankCode) ? (value as ReporterRankCode) : null,
  );

const reporterProfileColorSchema = z
  .string()
  .nullish()
  .transform((value): ReporterProfileColorCode | null =>
    REPORTER_PROFILE_COLORS.includes(value as ReporterProfileColorCode)
      ? (value as ReporterProfileColorCode)
      : null,
  );

export const storeReportSchema = z.object({
  reportId: z.number().int().safe(),
  itemId: z.number().int().safe(),
  itemName: z.string(),
  itemImageUrl: z.string().nullish(),
  price: z.number().int(),
  unit: z.string().nullish(),
  /** `format: date` — "2026-08-20" 모양. 표시용 상대 날짜는 화면에서 계산한다. */
  reportedDate: z.string().nullish(),
  /** 공공 시세와의 차액. 음수면 더 싸다. */
  publicPriceDiff: z.number().nullish(),
  /**
   * 공공 시세 대비 변동률. **화면은 이 값을 퍼센트로 읽는다**(-10 = -10%).
   * 스펙에 설명이 없고(`type: number`) 라이브 응답이 아직 비어 있어 실계약은 미확인이다 —
   * `농산물-문서/be-요청-2026-08-21-가게상세-제보행.md` 2번에서 단위를 확정한다.
   * 그때까지 우리 더미(`api/server/stores-fallback.ts`)도 퍼센트로 맞춰 둔다.
   */
  priceDiffRate: z.number().nullish(),
  /** ⚠️ BE 미제공 (위 REPORTER_RANKS 주석 참고). 없으면 화면이 "제보자 정보 없음"을 그린다. */
  reporterNickname: z.string().nullish(),
  reporterRank: reporterRankSchema,
  reporterProfileColor: reporterProfileColorSchema,
  /**
   * 스펙 enum이지만 값이 늘어날 때 화면이 통째로 죽지 않도록 fallback을 둔다 —
   * 모르는 값은 EQUAL로 본다(저렴/비쌈 어느 목록에도 넣지 않는다).
   */
  priceClassification: z
    .string()
    .nullish()
    .transform((value): PriceClassification =>
      value === "CHEAP" || value === "EXPENSIVE" ? value : "EQUAL",
    ),
});
export type StoreReport = z.infer<typeof storeReportSchema>;

export const storeReportsSchema = z.object({
  storeId: z.number().int().safe(),
  isTemporary: z.boolean().optional(),
  summary: z
    .object({
      cheapCount: z.number().int().nullish().transform((value) => value ?? 0),
      expensiveCount: z.number().int().nullish().transform((value) => value ?? 0),
    })
    .nullish()
    .transform((value) => value ?? { cheapCount: 0, expensiveCount: 0 }),
  reports: z.array(storeReportSchema),
  page: z.number().int().nullish(),
  size: z.number().int().nullish(),
  hasNext: z.boolean().nullish().transform((value) => value ?? false),
});
export type StoreReports = z.infer<typeof storeReportsSchema>;

export const storeReportsEnvelopeSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  data: storeReportsSchema,
});

// ── GET /api/v1/stores/recommendation — 제보가 저렴한 주변 가게 (홈 추천 카드) ────────

export const recommendedStoreSchema = z.object({
  storeId: z.number().int().safe(),
  storeName: z.string(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  addressName: z.string().nullish(),
  roadAddressName: z.string().nullish(),
  phone: z.string().nullish(),
  placeUrl: z.string().nullish(),
  distanceMeters: z.number().nullish(),
  /** 공공 시세보다 저렴한 상품 수. 카드의 "12가지" 자리. */
  cheapItemCount: z.number().int().nullish().transform((value) => value ?? 0),
  /** 대표 저렴 상품명. Figma 개발 주석상 카드는 최대 5개까지만 그린다. */
  cheapItems: z.array(z.string()).nullish().transform((value) => value ?? []),
  /** 대표 상품명에 못 담은 나머지 개수 — more 뱃지 값. */
  remainingItemCount: z.number().int().nullish().transform((value) => value ?? 0),
});
export type RecommendedStore = z.infer<typeof recommendedStoreSchema>;

export const storeRecommendationSchema = z.object({
  totalCount: z.number().nullish().transform((value) => value ?? 0),
  stores: z.array(recommendedStoreSchema),
});
export type StoreRecommendation = z.infer<typeof storeRecommendationSchema>;

export const storeRecommendationEnvelopeSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  data: storeRecommendationSchema,
});

// ---------------------------------------------------------------------------
// GET /api/v1/stores/{storeId} — 가게 상세 (2026-08-21 신설)
//
// 이 엔드포인트가 생기기 전까지 가게 상세 화면은 이름·주소·영업시간을 **직전 화면이 쿼리로
// 실어 날랐다**. 상세 URL을 직접 열면 프로필 줄이 비는 문제가 이걸로 닫힌다.
// ---------------------------------------------------------------------------

export const storeDetailSchema = z.object({
  storeId: z.number().int().safe(),
  storeName: z.string(),
  storeImageUrl: z.string().nullable().optional(),
  /** 로그인 사용자의 단골 여부 — **개인화 필드라 공유 캐시 금지.** */
  isLiked: z.boolean().nullish().transform((value) => value ?? false),
  favoriteCount: z.number().int().safe().nullable().optional(),
  cheapItemCount: z.number().int().safe().nullable().optional(),
  expensiveItemCount: z.number().int().safe().nullable().optional(),
  totalReportedItemCount: z.number().int().safe().nullable().optional(),
  /** 법정동 코드 — 앞자리 0 보존을 위해 문자열이다. */
  regionId: z.string().nullable().optional(),
  regionName: z.string().nullable().optional(),
  latestReportedDate: z.string().nullable().optional(),
  latestReportedAt: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  /** 좌표를 안 넘기면 거리·도보시간이 없다(쿼리 파라미터가 optional이다). */
  distance: z.number().int().safe().nullable().optional(),
  walkTimeMinutes: z.number().int().safe().nullable().optional(),
  /** 요일별 영업시간 문자열 목록. 없으면 빈 배열이다. */
  businessHours: z.array(z.string()).nullish().transform((value) => value ?? []),
  openStatus: z.string().nullable().optional(),
});
export type StoreDetail = z.infer<typeof storeDetailSchema>;

export const storeDetailEnvelopeSchema = z.object({
  data: storeDetailSchema,
});

/** BFF `/api/stores/{storeId}` 쿼리 — 좌표는 있으면 거리·도보시간이 채워지는 optional. */
const optionalNumberQuerySchema = z.preprocess((value) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}, z.coerce.number().finite().optional());

export const storeDetailRequestSchema = z.object({
  latitude: optionalNumberQuerySchema.pipe(z.number().min(-90).max(90).optional()),
  longitude: optionalNumberQuerySchema.pipe(z.number().min(-180).max(180).optional()),
});
export type StoreDetailRequest = z.infer<typeof storeDetailRequestSchema>;
