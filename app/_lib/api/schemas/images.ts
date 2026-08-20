// POST /api/v1/images — 제보 사진 업로드
//
// 요청은 JSON이 아니라 `multipart/form-data`(필드명 `image`)다. 응답 `data.imageUrl`이
// 제보 생성(`POST /items/{itemId}/reports`)의 `photoUrl`에 그대로 들어간다.
//
// 실패 분기는 status로만 본다 — 400(형식·용량) / 401(로그인) / 503(스토리지 장애).

import { z } from "zod";

export const imageUploadSchema = z.object({
  /** S3 영구 URL. 제보 저장 시 photoUrl로 사용한다. */
  imageUrl: z.string().min(1),
});
export type ImageUpload = z.infer<typeof imageUploadSchema>;

export const imageUploadEnvelopeSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  data: imageUploadSchema,
});
