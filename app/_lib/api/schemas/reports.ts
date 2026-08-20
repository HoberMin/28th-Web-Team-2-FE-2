// POST /api/v1/items/{itemId}/reports — 우리 동네 가격 제보
//
// 가게 정보는 카카오 장소 검색 결과를 그대로 실어 보낸다(서버가 가게를 새로 만들거나 붙인다).
// 응답은 `{ code, message, data }` envelope — items와 같은 모양이지만 이 엔드포인트 전용으로
// 벗긴다(공통 unwrap 유틸을 만들지 않는다 — `api-patterns`).
//
// ⚠️ 400/401/404/409는 스펙상 성공 스키마(`CreateUserReportResponse`)를 그대로 재사용하고
// 있어 에러 body 형식을 신뢰할 수 없다(`backend-api-reference` §2). 분기는 HTTP status로만
// 한다 — `server/reports.ts`는 body를 파싱하지 않고, 실패 시 `springFetch`가 던지는
// `ApiError`(status 기반)를 그대로 쓴다.

import { z } from "zod";
import { regionIdSchema } from "./regions";

/** 카카오 장소 검색 결과 모양. 필수는 id·placeName·addressName 셋뿐이다. */
export const storeRequestSchema = z.object({
  id: z.string().max(30),
  placeName: z.string().max(100),
  addressName: z.string().max(255),
  placeUrl: z.string().max(500).optional(),
  categoryName: z.string().max(255).optional(),
  roadAddressName: z.string().max(255).optional(),
  phone: z.string().max(30).optional(),
  categoryGroupCode: z.string().max(20).optional(),
  categoryGroupName: z.string().max(50).optional(),
  /** 카카오 좌표 표기 그대로 — x=경도, y=위도다(위경도 순서가 뒤집혀 있으니 주의). */
  x: z.number().optional(),
  y: z.number().optional(),
  distance: z.number().int().min(0).optional(),
});
export type StoreRequest = z.infer<typeof storeRequestSchema>;

export const REPORT_TYPES = ["PURCHASE", "OBSERVED"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const createReportRequestSchema = z.object({
  /** 법정동 코드. 앞자리 0이 있을 수 있어 끝까지 문자열로 다룬다. */
  regionId: regionIdSchema,
  reportType: z.enum(REPORT_TYPES),
  price: z.number().int().min(0),
  unit: z.string().max(20),
  amount: z.number().min(0),
  /** 기존 매장 id로 붙이는 경로 — 지금은 쓰지 않는다(항상 `store`로 새로 실어 보낸다). */
  storeId: z.number().int().min(0).nullable().optional(),
  store: storeRequestSchema.optional(),
  photoUrl: z.string().max(500).optional(),
});
export type CreateReportRequest = z.infer<typeof createReportRequestSchema>;

export const createReportResponseSchema = z.object({
  reportId: z.number().int().safe(),
  itemId: z.number().int().safe(),
  storeId: z.number().int().safe().nullable().optional(),
  /**
   * 제보 생성 시각. 스펙은 `format: date-time`만 선언하고 예시가 없어 오프셋 포함 여부를
   * 확인할 수 없다 — 지금은 화면이 이 값을 표시하지 않아 느슨하게 문자열로만 받는다.
   */
  reportedAt: z.string(),
});
export type CreateReportResponse = z.infer<typeof createReportResponseSchema>;

/** POST .../reports 전용 envelope — `/regions/search`·`/items`와 같은 모양이지만 따로 둔다. */
export const createReportEnvelopeSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  data: createReportResponseSchema,
});

// ── GET /api/v1/regions/{regionId}/reports/lowest-prices — 동네 최근 7일 최저가 ───────
//
// F01 홈의 「우리 동네 최저가」 목록이 쓴다. 등락(`priceDiffRate`)은 **공공 시세 대비**라
// 부호가 음수면 공공가보다 싸다는 뜻이다 — 시간에 따른 등락이 아니다.

export const regionLowestPriceItemSchema = z.object({
  rank: z.number().int().nullish(),
  reportId: z.number().int().safe(),
  itemId: z.number().int().safe(),
  itemName: z.string(),
  itemImageUrl: z.string().nullish(),
  storeId: z.number().int().safe().nullish(),
  storeName: z.string().nullish(),
  price: z.number().int(),
  unit: z.string().nullish(),
  priceDiffRate: z.number().nullish(),
});
export type RegionLowestPriceItem = z.infer<typeof regionLowestPriceItemSchema>;

export const regionLowestPricesSchema = z.object({
  regionName: z.string().nullish(),
  items: z.array(regionLowestPriceItemSchema),
});
export type RegionLowestPrices = z.infer<typeof regionLowestPricesSchema>;

export const regionLowestPricesEnvelopeSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  data: regionLowestPricesSchema,
});
