// GET /api/v1/stores/nearby — 지도 중심 주변 가게

import { z } from "zod";

/** 지도에서 조회할 수 있는 최대 반경. 축소해도 다른 동네가 섞이지 않도록 500m로 고정한다. */
export const MAX_NEARBY_STORE_RADIUS = 500;
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
