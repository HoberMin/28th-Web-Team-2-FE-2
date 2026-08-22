// POST /api/v1/images — 제보 사진 업로드
//
// 요청은 JSON이 아니라 `multipart/form-data`(필드명 `image`)다. 응답 `data.imageUrl`이
// 제보 생성(`POST /items/{itemId}/reports`)의 `photoUrl`에 그대로 들어간다.
//
// 실패 분기는 status로만 본다 — 400(형식·용량) / 401(로그인) / 503(스토리지 장애).

import { z } from "zod";

/** 업로드 파일 크기 상한. 실제 허용 MIME은 백엔드가 최종 검증한다. */
export const MAX_UPLOAD_IMAGE_BYTES = 5 * 1024 * 1024;

export type UploadImageValidationError = "empty" | "tooLarge" | "unsupportedType";

/**
 * `accept`는 파일 선택기 필터일 뿐이라 조작된 File을 막지 못한다.
 * 브라우저와 Server Action 양쪽에서 이 함수를 다시 실행한다.
 */
export function validateUploadImage(file: {
  size: number;
  type: string;
}): UploadImageValidationError | null {
  if (file.size <= 0) return "empty";
  if (file.size > MAX_UPLOAD_IMAGE_BYTES) return "tooLarge";
  if (!file.type.toLowerCase().startsWith("image/")) return "unsupportedType";
  return null;
}

export function uploadImageValidationMessage(error: UploadImageValidationError): string {
  if (error === "empty") return "사진 파일을 찾지 못했어요. 다시 선택해 주세요.";
  if (error === "tooLarge") return "사진 용량이 너무 커요. 5MB 이하로 올려 주세요.";
  return "이미지 파일만 올릴 수 있어요.";
}

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
