import { ApiError } from "@/app/_lib/api/api-error";

/**
 * `/api/my-reports*` 전용 에러 매핑.
 *
 * 내 제보는 **남의 제보를 건드렸을 때도 404**로 온다(존재 여부를 흘리지 않는 설계).
 * 그래서 404를 "없음"이 아니라 "수정·삭제할 수 없는 제보"로 표현한다.
 * 인증 실패(401)와 통신 실패(5xx)를 뭉치지 않는다 — 뭉치면 서버 장애가 전원 재로그인으로
 * 번진다(`review-standard` 인증·세션 항목).
 */
export function myReportsApiErrorResponse(error: unknown, badRequestMessage: string): Response {
  if (!(error instanceof ApiError)) throw error;

  console.error("[my-reports] 내 제보 처리 실패", {
    kind: error.kind,
    status: error.status,
    endpoint: error.endpoint,
  });

  if (error.kind === "unauthorized") {
    return Response.json({ message: "로그인이 필요해요." }, { status: 401 });
  }
  if (error.kind === "forbidden") {
    return Response.json({ message: "권한이 없어요." }, { status: 403 });
  }
  if (error.kind === "notFound") {
    return Response.json({ message: "수정하거나 삭제할 수 없는 제보예요." }, { status: 404 });
  }
  if (error.kind === "badRequest") {
    return Response.json({ message: badRequestMessage }, { status: 400 });
  }

  const status = error.kind === "network" ? 503 : 502;
  return Response.json(
    { message: "제보를 처리하지 못했어요. 잠시 후 다시 시도해 주세요." },
    { status },
  );
}
