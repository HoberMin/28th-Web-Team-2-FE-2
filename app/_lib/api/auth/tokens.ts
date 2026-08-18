// 토큰 쿠키 규약 + 만료 판단.
//
// 이 파일은 **proxy.ts(Edge 런타임)에서도 import된다** — Node 전용 API나 무거운
// 라이브러리를 넣지 않는다. `server-only`도 붙이지 않는다(미들웨어에서 못 쓴다).
//
// ⚠️ 여기서 **서명을 검증하지 않는다.** 검증은 Spring이 한다. 우리는 "곧 만료되나"만
// 보면 되고, 진짜 유효성 판정은 서버 응답(401)에 맡긴다. 프론트에서 서명을 검증하려면
// 비밀키가 필요해지는데 그건 절대 하면 안 되는 일이다.

/** accessToken — 우리 도메인 httpOnly 쿠키. 브라우저 JS는 읽지 못한다. */
export const ACCESS_TOKEN_COOKIE = "mg_access_token";

/**
 * refreshToken — Spring이 자기 도메인에 심으려던 쿠키를 **우리 도메인으로 옮겨 심은 것**.
 * 서버 fetch에는 쿠키 저장소가 없어서, 재발급할 때 이 값을 `Cookie` 헤더로 직접 붙인다.
 */
export const REFRESH_TOKEN_COOKIE = "mg_refresh_token";

/** Spring이 내려주는 쿠키 이름 (`kakao_login.md` 1.1). 우리 쿠키 이름과 다르다. */
export const SPRING_REFRESH_COOKIE = "refreshToken";

/**
 * 만료 몇 초 전부터 미리 갱신할지. 렌더 도중에 만료되는 걸 막는 여유분이다.
 * 서버 시계 차이도 이 안에서 흡수된다.
 */
export const REFRESH_LEEWAY_SECONDS = 60;

// TODO(✍️): refreshToken 수명을 몰라서 30일로 잡았다. BE 답변(요청사항 C표)이 오면 맞춘다.
// 짧게 잡으면 멀쩡한 refreshToken을 우리가 먼저 버려 불필요한 재로그인이 생긴다.
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * 두 쿠키가 옵션을 공유하지 않는다 — 수명 의미가 다르기 때문이다.
 * 하나로 묶어두면 나중에 refresh 수명을 고칠 때 access 쿠키까지 딸려 바뀐다.
 *
 * `secure`가 프로덕션 조건인 건 로컬 http 개발 때문이다. Vercel은 프리뷰 빌드도
 * `NODE_ENV=production`이라 배포 환경에서는 항상 켜진다.
 */
const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

/**
 * accessToken 쿠키는 refresh와 같은 기간 살려둔다. 값 자체의 만료는 JWT `exp`가 들고 있고
 * `needsRefresh`가 그걸 보므로, 쿠키를 먼저 지워봐야 갱신 기회만 잃는다.
 */
export const ACCESS_COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: REFRESH_COOKIE_MAX_AGE,
} as const;

export const REFRESH_COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: REFRESH_COOKIE_MAX_AGE,
} as const;

/** JWT payload에서 `exp`만 꺼낸다. 서명은 보지 않는다. */
export function readTokenExpiry(token: string): number | null {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = JSON.parse(atob(padded)) as unknown;
    if (typeof decoded !== "object" || decoded === null) return null;
    const exp = (decoded as { exp?: unknown }).exp;
    return typeof exp === "number" ? exp : null;
  } catch {
    // 우리가 모르는 형식이면 만료로 취급한다(안전한 쪽).
    return null;
  }
}

/**
 * 지금 갱신해야 하는 토큰인가.
 * `exp`를 못 읽으면 **갱신 대상으로 본다** — 모르는 토큰을 그대로 쓰는 것보다 안전하다.
 */
export function needsRefresh(token: string | undefined, nowSeconds: number): boolean {
  if (!token) return true;
  const exp = readTokenExpiry(token);
  if (exp === null) return true;
  return exp - REFRESH_LEEWAY_SECONDS <= nowSeconds;
}

/** Spring 응답의 `Set-Cookie`에서 refreshToken 값만 뽑는다. */
export function extractRefreshToken(setCookieHeaders: string[]): string | null {
  for (const header of setCookieHeaders) {
    const [pair] = header.split(";");
    const separator = pair.indexOf("=");
    if (separator === -1) continue;
    if (pair.slice(0, separator).trim() !== SPRING_REFRESH_COOKIE) continue;
    const value = pair.slice(separator + 1).trim();
    if (value) return value;
  }
  return null;
}
