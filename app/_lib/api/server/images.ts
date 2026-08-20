import "server-only";

import { imageUploadEnvelopeSchema } from "../schemas/images";
import { springFetch } from "../spring";

/** Spring이 400으로 되돌리기 전에 여기서 먼저 거른다. 값은 우리가 정한 방어선이다. */
export const MAX_UPLOAD_IMAGE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/**
 * 제보 사진 업로드. 응답 `imageUrl`을 제보 생성의 `photoUrl`로 넘긴다.
 *
 * 요청이 JSON이 아니라 multipart라 `springFetch`에 `FormData`를 그대로 넘긴다
 * (`Content-Type`은 브라우저·undici가 boundary와 함께 직접 붙여야 해서 우리가 설정하지 않는다).
 */
export async function uploadImage(params: { file: File; token: string }): Promise<string> {
  const form = new FormData();
  form.append("image", params.file);

  const envelope = await springFetch({
    path: "/api/v1/images",
    method: "POST",
    body: form,
    token: params.token,
    schema: imageUploadEnvelopeSchema,
    cache: "no-store",
  });
  return envelope.data.imageUrl;
}
