// 외부 Spring 호출 실패를 화면이 구분해서 처리할 수 있게 표준화한 에러.
//
// 파일명이 `api-error.ts`인 이유: Next는 `error.*`를 **에러 바운더리 컨벤션 파일**로 보고
// "Client Component여야 한다"며 빌드를 세운다. `app/_lib/` 같은 비공개 폴더 안이어도 그렇다.
//
// **본문(body)을 신뢰하지 않는다.** 스펙(`/v3/api-docs`)이 400·401·404·502에
// 성공 스키마를 그대로 재사용하고 있어 에러 응답의 형태를 알 수 없다
// (`backend-api-reference` §2). 그래서 분기는 HTTP status로만 한다.
// BE가 에러 형식을 확정해주면 그때 body 파싱을 여기 추가한다.

export type ApiErrorKind =
  | "unauthorized" // 401 — 토큰 없음·만료
  | "forbidden" // 403
  | "notFound" // 404
  | "conflict" // 409 — 닉네임 중복 등
  | "badRequest" // 400·422
  | "upstream" // 502·503 — Spring이 외부(KAMIS·카카오)에서 실패
  | "server" // 5xx
  | "network" // 요청 자체가 실패 (DNS·타임아웃)
  | "parse"; // 응답이 우리가 아는 모양이 아님 (zod 실패)

function kindOf(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 409) return "conflict";
  if (status === 400 || status === 422) return "badRequest";
  if (status === 502 || status === 503) return "upstream";
  if (status >= 500) return "server";
  return "badRequest";
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;
  /** 어느 호출이 실패했는지 — 로그 추적용. 토큰은 절대 담지 않는다. */
  readonly endpoint: string;

  constructor(params: { kind: ApiErrorKind; status: number; endpoint: string; message?: string }) {
    super(params.message ?? `${params.endpoint} 실패 (${params.status})`);
    this.name = "ApiError";
    this.kind = params.kind;
    this.status = params.status;
    this.endpoint = params.endpoint;
  }

  static fromStatus(status: number, endpoint: string): ApiError {
    return new ApiError({ kind: kindOf(status), status, endpoint });
  }

  static network(endpoint: string, cause: unknown): ApiError {
    const detail = cause instanceof Error ? cause.message : String(cause);
    return new ApiError({
      kind: "network",
      status: 0,
      endpoint,
      message: `${endpoint} 요청 실패: ${detail}`,
    });
  }

  static parse(endpoint: string, detail: string): ApiError {
    return new ApiError({
      kind: "parse",
      status: 0,
      endpoint,
      message: `${endpoint} 응답이 예상과 다릅니다: ${detail}`,
    });
  }

  /** 재발급으로 회복 가능한 실패인지 — middleware·BFF가 판단에 쓴다. */
  get isAuthExpired(): boolean {
    return this.kind === "unauthorized";
  }
}
