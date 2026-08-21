// GET /api/v1/regions/{regionId}/items/{itemId}/reports — 동네 품목 제보 목록
//
// ⚠️ 이 엔드포인트는 `{ code, message, data }` envelope로 온다.

import { z } from "zod";

export const REGION_ITEM_REPORT_SORTS = ["PRICE_ASC", "LATEST"] as const;
export type RegionItemReportSort = (typeof REGION_ITEM_REPORT_SORTS)[number];

export const REPORT_CLASSIFICATIONS = ["CHEAP", "EXPENSIVE", "EQUAL"] as const;
export type ReportClassification = (typeof REPORT_CLASSIFICATIONS)[number];

export const regionItemReportSchema = z.object({
  reportId: z.number().int().safe(),
  /** 가게를 지정하지 않은 제보가 있어 nullable이다. */
  storeId: z.number().int().safe().nullable().optional(),
  storeName: z.string().nullable().optional(),
  price: z.number().int().safe(),
  amount: z.number(),
  unit: z.string(),
  /** `YYYY-MM-DD` */
  reportedAt: z.string(),
  priceGap: z.number().int().safe().nullable().optional(),
  priceDiffRate: z.number().nullable().optional(),
  classification: z.enum(REPORT_CLASSIFICATIONS).nullable().optional(),
});
export type RegionItemReport = z.infer<typeof regionItemReportSchema>;

export const regionItemReportPageSchema = z.object({
  /** 법정동 코드 — 앞자리 0이 있을 수 있어 문자열이다. */
  regionId: z.string(),
  regionName: z.string(),
  itemId: z.number().int().safe(),
  totalCount: z.number().int().safe(),
  /** 제보가 없으면 빈 배열이다 — 에러가 아니다. */
  reports: z.array(regionItemReportSchema),
  page: z.number().int().safe(),
  size: z.number().int().safe(),
  hasNext: z.boolean(),
});
export type RegionItemReportPage = z.infer<typeof regionItemReportPageSchema>;

export const regionItemReportPageEnvelopeSchema = z.object({
  data: regionItemReportPageSchema,
});
