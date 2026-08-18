import { describe, expect, it } from "vitest";
import { ApiError, type ApiErrorKind } from "./api-error";

describe("ApiError", () => {
  it.each<[number, ApiErrorKind]>([
    [400, "badRequest"],
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "notFound"],
    [409, "conflict"],
    [422, "badRequest"],
    [500, "server"],
    [502, "upstream"],
    [503, "upstream"],
  ])("HTTP %i를 %s 오류로 분류한다", (status, kind) => {
    const error = ApiError.fromStatus(status, "GET /resource");

    expect(error).toMatchObject({
      name: "ApiError",
      status,
      kind,
      endpoint: "GET /resource",
    });
  });

  it("인증 만료는 401만 참으로 판정한다", () => {
    expect(ApiError.fromStatus(401, "POST /auth/reissue").isAuthExpired).toBe(true);
    expect(ApiError.fromStatus(403, "POST /auth/reissue").isAuthExpired).toBe(false);
    expect(ApiError.fromStatus(503, "POST /auth/reissue").isAuthExpired).toBe(false);
  });

  it("네트워크 실패 원인을 상태 없는 ApiError로 보존한다", () => {
    const error = ApiError.network("GET /news", new Error("connection refused"));

    expect(error).toMatchObject({
      kind: "network",
      status: 0,
      endpoint: "GET /news",
      message: "GET /news 요청 실패: connection refused",
    });
  });

  it("응답 파싱 실패를 upstream 형식 오류로 구분한다", () => {
    const error = ApiError.parse("GET /items", "id가 숫자가 아님");

    expect(error).toMatchObject({
      kind: "parse",
      status: 0,
      endpoint: "GET /items",
      message: "GET /items 응답이 예상과 다릅니다: id가 숫자가 아님",
    });
  });
});
