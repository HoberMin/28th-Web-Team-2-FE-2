import "server-only";

import { imageUploadEnvelopeSchema } from "../schemas/images";
import { springFetch } from "../spring";

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
