import { ApiError } from "@/app/_lib/api/api-error";

/**
 * `/api/regions/me*` 전용 에러 매핑.
 *
 * `_api-error.ts`(`regionApiErrorResponse`)와 나누는 이유: 이쪽은 로그인 필수(`bearerAuth`)라
 * 401·409(중복·최대 개수 초과)를 화면이 구분해야 한다 — 공개 지역 조회(search·nearby)는
 * 그 구분이 필요 없어서 억지로 합치면 각 라우트가 안 쓰는 분기를 떠안게 된다.
 */
export function userRegionsApiErrorResponse(error: unknown, badRequestMessage: string): Response {
  if (!(error instanceof ApiError)) throw error;

  console.error("[regions] 관심 지역 처리 실패", {
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
  if (error.kind === "badRequest") {
    return Response.json({ message: badRequestMessage }, { status: 400 });
  }
  if (error.kind === "conflict") {
    return Response.json(
      { message: "이미 등록했거나 더 등록할 수 없는 동네예요." },
      { status: 409 },
    );
  }
  if (error.kind === "notFound") {
    return Response.json({ message: "사용자를 찾을 수 없어요." }, { status: 404 });
  }

  const status = error.kind === "network" ? 503 : 502;
  return Response.json(
    { message: "관심 지역을 처리하지 못했어요. 잠시 후 다시 시도해 주세요." },
    { status },
  );
}
