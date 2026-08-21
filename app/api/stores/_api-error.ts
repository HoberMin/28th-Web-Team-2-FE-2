import { ApiError } from "@/app/_lib/api/api-error";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
} as const;

export function privateJson(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: PRIVATE_NO_STORE_HEADERS });
}

/**
 * @param fallbackMessage 호출부 맥락에 맞는 기본 실패 문구. `notFound`는 항상 "가게를 찾을 수
 *   없어요"로 고정한다 — 어느 가게 관련 조회든 404의 의미가 같기 때문이다.
 */
export function storesApiErrorResponse(
  error: unknown,
  fallbackMessage = "주변 가게를 불러오지 못했어요.",
): Response {
  if (error instanceof ApiError) {
    console.error("[stores-bff] upstream request failed", {
      kind: error.kind,
      status: error.status,
      endpoint: error.endpoint,
    });

    if (error.kind === "unauthorized") {
      return privateJson({ message: "로그인이 필요해요." }, 401);
    }
    if (error.kind === "notFound") {
      return privateJson({ message: "가게를 찾을 수 없어요." }, 404);
    }
    if (error.kind === "badRequest") {
      return privateJson({ message: "가게 조회 조건을 확인해 주세요." }, 400);
    }
    if (error.kind === "network") {
      return privateJson({ message: "가게 조회 서버에 연결할 수 없어요." }, 503);
    }
    return privateJson({ message: fallbackMessage }, 502);
  }

  console.error("[stores-bff] unexpected error");
  return privateJson({ message: fallbackMessage }, 500);
}
