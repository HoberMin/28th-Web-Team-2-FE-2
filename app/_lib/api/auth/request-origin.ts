import "server-only";

function firstForwardedValue(value: string | null): string | null {
  const first = value?.split(",", 1)[0]?.trim();
  return first || null;
}

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

function expectedRequestOrigin(request: Request): string | null {
  const requestUrl = new URL(request.url);
  const forwardedHost = firstForwardedValue(request.headers.get("x-forwarded-host"));
  if (!forwardedHost) return requestUrl.origin;

  const forwardedProto =
    firstForwardedValue(request.headers.get("x-forwarded-proto")) ??
    requestUrl.protocol.slice(0, -1);

  return parseOrigin(`${forwardedProto}://${forwardedHost}`);
}

/**
 * 브라우저의 쿠키 인증 POST가 현재 Next/Vercel origin에서 시작됐는지 확인한다.
 *
 * Vercel에서는 내부 request URL과 사용자에게 보이는 origin이 다를 수 있어
 * `x-forwarded-host`·`x-forwarded-proto`가 있으면 첫 proxy 값을 기준으로 삼는다.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const actualOrigin = parseOrigin(origin);
  const expectedOrigin = expectedRequestOrigin(request);
  return actualOrigin !== null && expectedOrigin !== null && actualOrigin === expectedOrigin;
}

export function crossOriginResponse(request: Request): Response | null {
  if (isSameOriginRequest(request)) return null;
  return Response.json({ message: "요청 출처를 확인할 수 없어요." }, { status: 403 });
}
