// POST /api/v1/items/{itemId}/reports — 우리 동네 가격 제보
//
// 가게 정보는 카카오 장소 검색 결과를 그대로 실어 보낸다(서버가 가게를 새로 만들거나 붙인다).

import { z } from "zod";

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

export const createReportRequestSchema = z.object({
  price: z.number().int().min(0),
  unit: z.string().max(20),
  amount: z.number().min(0),
  store: storeRequestSchema,
  photoUrl: z.string().max(500).optional(),
});
export type CreateReportRequest = z.infer<typeof createReportRequestSchema>;

export const createReportResponseSchema = z.object({
  reportId: z.number(),
});
export type CreateReportResponse = z.infer<typeof createReportResponseSchema>;
