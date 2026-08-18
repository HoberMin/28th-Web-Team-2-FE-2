import "server-only";

function parseOrigin(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username !== "" ||
    url.password !== "" ||
    url.pathname !== "/" ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    return null;
  }

  return url.origin;
}

/**
 * 브라우저의 쿠키 인증 POST가 현재 Next 요청 origin에서 시작됐는지 확인한다.
 *
 * `x-forwarded-host`·`x-forwarded-proto`는 클라이언트 입력과 신뢰 프록시가 붙인 값을
 * 여기서 구분할 수 없어 사용하지 않는다.
 * TODO(인프라): 내부 URL을 전달하는 reverse proxy 배포가 생기면 신뢰할 public origin을
 * 환경 설정으로 명시하고 allowlist로 검증한다.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const actualOrigin = parseOrigin(origin);
  return actualOrigin !== null && actualOrigin === new URL(request.url).origin;
}

export function crossOriginResponse(request: Request): Response | null {
  if (isSameOriginRequest(request)) return null;
  return Response.json({ message: "요청 출처를 확인할 수 없어요." }, { status: 403 });
}
