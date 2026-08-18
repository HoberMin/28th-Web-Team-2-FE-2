// Spring base URL은 server fetch와 Edge proxy가 함께 쓴다.
// Edge 번들에서도 안전해야 하므로 `server-only`나 Node 전용 API를 import하지 않는다.

const DEFAULT_SPRING_API_BASE_URL = "https://api.marketgo.kro.kr";

export const SPRING_REQUEST_TIMEOUT_MS = 10_000;

/**
 * 토큰을 전달할 upstream을 HTTPS origin 하나로 제한한다.
 *
 * path·query·hash를 허용하면 `new URL("/api/...", base)`의 의미가 환경별로 달라지고,
 * credentials나 HTTP를 허용하면 accessToken·refreshToken·idToken이 노출될 수 있다.
 */
export function getSpringBaseUrl(
  value = process.env.SPRING_API_BASE_URL ?? DEFAULT_SPRING_API_BASE_URL,
): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("SPRING_API_BASE_URL은 유효한 HTTPS origin이어야 합니다.");
  }

  if (
    url.protocol !== "https:" ||
    url.username !== "" ||
    url.password !== "" ||
    url.pathname !== "/" ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new Error("SPRING_API_BASE_URL은 credentials·path 없는 HTTPS origin이어야 합니다.");
  }

  return url;
}
