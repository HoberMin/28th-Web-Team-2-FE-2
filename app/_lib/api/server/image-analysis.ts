import "server-only";

import {
  imageAnalysisEnvelopeSchema,
  type ImageAnalysis,
  type ImageAnalysisRequest,
} from "../schemas/image-analysis";
import { springFetch } from "../spring";

/**
 * 제보 사진에서 품목·가격·수량 후보를 인식한다.
 *
 * **결과는 후보다** — 스펙이 "일부 값이 null일 수 있다"고 명시한다. 화면은 이 값으로 폼을
 * 미리 채우되 사용자가 고칠 수 있어야 하고, `confidence`가 낮으면 확인을 유도한다.
 *
 * 매번 다른 이미지라 캐시 의미가 없어 `no-store`다.
 * `imageUrl`은 `POST /api/v1/images` 업로드 결과를 넘긴다.
 */
export async function analyzeReportImage(params: {
  body: ImageAnalysisRequest;
  token: string | undefined;
}): Promise<ImageAnalysis> {
  const envelope = await springFetch({
    path: "/api/v1/user-reports/image-analysis",
    method: "POST",
    body: { ...params.body },
    token: params.token,
    schema: imageAnalysisEnvelopeSchema,
    cache: "no-store",
  });
  return envelope.data;
}
