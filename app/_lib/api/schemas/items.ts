// GET /api/v1/items — 품목 목록과 공공가격
//
// ⚠️ 응답을 envelope로 감싸지 않는다. 이 백엔드는 엔드포인트마다 형태가 달라
// 공통 unwrap 유틸을 두지 않는다 (`backend-api-reference` §2).

import { z } from "zod";

export const ITEM_SORTS = ["NAME_ASC", "PRICE_ASC", "PRICE_DESC"] as const;
export type ItemSort = (typeof ITEM_SORTS)[number];

export const ITEM_CATEGORIES = [
  "ROOT_VEGETABLES",
  "LEAFY_GREENS",
  "FRUITING_VEGETABLES",
  "PEPPERS",
  "SEASONINGS",
  "MUSHROOMS",
  "FRUITS",
] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const itemSchema = z.object({
  itemId: z.number(),
  itemName: z.string(),
  itemImageUrl: z.string().optional(),
  /** 스펙상 nullable — 단위가 정해지지 않은 품목이 있다. */
  defaultUnit: z.string().nullable().optional(),
  price: z.number(),
  /** 직전 대비 가격 차이(원). */
  priceGap: z.number(),
  /** 직전 대비 변동률. */
  priceDiffRate: z.number(),
  /** 로그인 사용자의 찜 여부 — **이 필드 때문에 응답을 공유 캐시에 넣으면 안 된다.** */
  isLiked: z.boolean(),
});
export type Item = z.infer<typeof itemSchema>;

export const itemPageSchema = z.object({
  baseDate: z.string(),
  totalCount: z.number(),
  /** 카테고리별 개수 — 키가 고정이 아니라 record로 받는다. */
  categoryCounts: z.record(z.string(), z.number()).optional(),
  items: z.array(itemSchema),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean(),
});
export type ItemPage = z.infer<typeof itemPageSchema>;
