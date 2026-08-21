// POST /api/v1/user-reports/image-analysis — 제보 사진에서 입력값 후보 인식
//
// ⚠️ envelope(`{ code, message, data }`)로 온다.
// **인식 결과는 후보일 뿐이다** — 스펙이 "일부 값이 null일 수 있다"고 명시한다.
// 화면은 이 값을 폼에 미리 채우되 사용자가 고칠 수 있어야 한다.

import { z } from "zod";

export const analyzedItemSchema = z.object({
  itemId: z.number().int().safe(),
  name: z.string(),
  unit: z.string(),
  /** 0~1. 낮으면 화면에서 확인을 유도한다. */
  confidence: z.number(),
});

export const analyzedPriceSchema = z.object({
  value: z.number().int().safe(),
  currency: z.string(),
  confidence: z.number(),
  basis: z.string().nullable().optional(),
  unitMatched: z.boolean().nullable().optional(),
});

export const analyzedAmountSchema = z.object({
  value: z.number(),
  confidence: z.number(),
});

export const imageAnalysisSchema = z.object({
  item: analyzedItemSchema.nullable().optional(),
  price: analyzedPriceSchema.nullable().optional(),
  amount: analyzedAmountSchema.nullable().optional(),
});
export type ImageAnalysis = z.infer<typeof imageAnalysisSchema>;

export const imageAnalysisEnvelopeSchema = z.object({ data: imageAnalysisSchema });

/** 요청 본문 — 업로드된 이미지 URL(`POST /api/v1/images` 결과)과, 알면 품목 힌트. */
export const imageAnalysisRequestSchema = z.object({
  imageUrl: z.string().min(1),
  itemId: z.number().int().safe().nullable().optional(),
});
export type ImageAnalysisRequest = z.infer<typeof imageAnalysisRequestSchema>;
