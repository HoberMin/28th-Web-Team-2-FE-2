import { ApiError } from "@/app/_lib/api/api-error";

/** Spring의 불명확한 에러 body를 노출하지 않고 HTTP status만 화면용 응답으로 번역한다. */
export function regionApiErrorResponse(error: unknown, badRequestMessage: string): Response {
  if (!(error instanceof ApiError)) throw error;

  console.error("[regions] 지역 조회 실패", {
    kind: error.kind,
    status: error.status,
    endpoint: error.endpoint,
  });

  if (error.kind === "badRequest") {
    return Response.json({ message: badRequestMessage }, { status: 400 });
  }

  const status = error.kind === "network" ? 503 : 502;
  return Response.json(
    { message: "동네를 불러오지 못했어요. 잠시 후 다시 시도해 주세요." },
    { status },
  );
}
