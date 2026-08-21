// GET /api/v1/items/{itemId}/public-prices — 기간별 공공가격 추이
// GET /api/v1/items/{itemId}/online-prices — 채널별 온라인 최저가
//
// ⚠️ 둘 다 envelope 없이 **최상위 객체**로 온다(품목 상세와 같다). 이 백엔드는 감싼 것과
// 안 감싼 것이 섞여 있어 공통 unwrap 유틸을 두지 않는다.

import { z } from "zod";

export const PUBLIC_PRICE_PERIODS = ["WEEK", "MONTH", "YEAR"] as const;
export type PublicPricePeriod = (typeof PUBLIC_PRICE_PERIODS)[number];

export const publicPricePointSchema = z.object({
  /** `YYYY-MM-DD`. 문자열 그대로 둔다 — 화면이 라벨로만 쓰고 시간대 변환이 필요 없다. */
  date: z.string(),
  price: z.number().int().safe(),
});
export type PublicPricePoint = z.infer<typeof publicPricePointSchema>;

export const publicPriceTrendSchema = z.object({
  itemId: z.number().int().safe(),
  defaultUnit: z.string().nullable().optional(),
  period: z.enum(PUBLIC_PRICE_PERIODS),
  /** 적재 전이면 빈 배열이다 — 에러가 아니라 정상 200이다. */
  points: z.array(publicPricePointSchema),
});
export type PublicPriceTrend = z.infer<typeof publicPriceTrendSchema>;

export const onlineChannelPriceSchema = z.object({
  channelId: z.number().int().safe(),
  channelName: z.string(),
  channelKind: z.string().nullable().optional(),
  productName: z.string(),
  price: z.number().int().safe(),
  unit: z.string(),
  deliveryNote: z.string().nullable().optional(),
  productUrl: z.string().nullable().optional(),
  collectedAt: z.string(),
});
export type OnlineChannelPrice = z.infer<typeof onlineChannelPriceSchema>;

export const onlinePricesSchema = z.object({
  itemId: z.number().int().safe(),
  /** 수집 전이면 빈 배열이다. */
  onlinePrices: z.array(onlineChannelPriceSchema),
});
export type OnlinePrices = z.infer<typeof onlinePricesSchema>;
