// GET /api/v1/stores/nearby — 지도 중심 주변 가게

import { z } from "zod";

export const nearbyStoreSchema = z.object({
  storeId: z.number(),
  storeName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  addressName: z.string().optional(),
  roadAddressName: z.string().optional(),
  phone: z.string().optional(),
  placeUrl: z.string().optional(),
  distanceMeters: z.number().optional(),
  /** 로그인 사용자의 단골 여부 — 개인화 필드다(공유 캐시 금지). */
  isLiked: z.boolean(),
});
export type NearbyStore = z.infer<typeof nearbyStoreSchema>;

export const nearbyStoresSchema = z.object({
  totalCount: z.number(),
  stores: z.array(nearbyStoreSchema),
});
export type NearbyStores = z.infer<typeof nearbyStoresSchema>;
