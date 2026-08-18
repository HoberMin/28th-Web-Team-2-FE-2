import "server-only";

import { extractRefreshToken, SPRING_REFRESH_COOKIE } from "../auth/tokens";
import { ApiError } from "../api-error";
import { tokenResponseSchema, type AuthProvider } from "../schemas/auth";
import { springRaw } from "../spring";

export interface SpringTokens {
  accessToken: string;
  /** Spring이 `Set-Cookie`로 내려준 값. 안 내려주는 경우(재발급 무회전)도 있어 nullable. */
  refreshToken: string | null;
}

async function readTokens(response: Response, endpoint: string): Promise<SpringTokens> {
  if (!response.ok) throw ApiError.fromStatus(response.status, endpoint);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (cause) {
    throw ApiError.parse(endpoint, cause instanceof Error ? cause.message : "JSON 아님");
  }

  const parsed = tokenResponseSchema.safeParse(payload);
  if (!parsed.success) throw ApiError.parse(endpoint, "accessToken이 없습니다");

  return {
    accessToken: parsed.data.accessToken,
    refreshToken: extractRefreshToken(response.headers.getSetCookie()),
  };
}

/**
 * 카카오 OIDC idToken으로 서비스 토큰 발급.
 *
 * ⚠️ 카카오 **access_token이 아니라 id_token**을 넘겨야 한다. 카카오 로그인 시
 * `openid` scope를 요청하지 않으면 id_token이 나오지 않는다.
 */
export async function login(params: {
  provider: AuthProvider;
  idToken: string;
}): Promise<SpringTokens> {
  const path = `/api/auth/${params.provider}/login`;
  const response = await springRaw({
    path,
    method: "POST",
    body: { idToken: params.idToken },
    cache: "no-store",
  });
  return readTokens(response, `POST ${path}`);
}

/**
 * refreshToken으로 accessToken 재발급.
 *
 * 서버 fetch에는 쿠키 저장소가 없어서 **`Cookie` 헤더를 손으로 붙인다.**
 * 브라우저였다면 자동으로 붙었을 값이다.
 */
export async function reissue(refreshToken: string): Promise<SpringTokens> {
  const response = await springRaw({
    path: "/api/auth/reissue",
    method: "POST",
    cookie: `${SPRING_REFRESH_COOKIE}=${refreshToken}`,
    cache: "no-store",
  });
  return readTokens(response, "POST /api/auth/reissue");
}

/**
 * 서버 쪽 refreshToken 폐기.
 *
 * 스펙(`/v3/api-docs`)에는 `security` 선언이 없고 200을 준다고 돼 있는데,
 * 전달받은 문서는 `Bearer 필요 / 204`라고 한다(BE 확인 요청 C표). 어느 쪽이든 동작하도록
 * **토큰이 있으면 붙이고, 실패해도 우리 쿠키는 지운다** — 로그아웃이 서버 사정으로
 * 막히면 안 되기 때문이다.
 */
export async function logout(params: {
  accessToken?: string;
  refreshToken?: string;
}): Promise<void> {
  try {
    await springRaw({
      path: "/api/auth/logout",
      method: "POST",
      token: params.accessToken,
      cookie: params.refreshToken ? `${SPRING_REFRESH_COOKIE}=${params.refreshToken}` : undefined,
      cache: "no-store",
    });
  } catch {
    // 서버 폐기가 실패해도 클라이언트 세션은 끊는다. 호출부가 쿠키를 지운다.
  }
}
