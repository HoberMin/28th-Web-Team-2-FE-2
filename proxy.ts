// 토큰 갱신 — RSC 렌더 **전에** 도는 유일한 지점.
//
// 파일명이 `proxy.ts`인 이유: Next 16에서 `middleware` 컨벤션이 **`proxy`로 이름이 바뀌었다.**
// `middleware.ts`로 두면 deprecated 경고가 뜬다. export 이름도 `proxy`여야 한다.
//
// 왜 여기냐: Server Component는 쿠키를 **읽을 수만 있고 쓸 수 없다.** RSC 안에서 재발급을
// 받아봐야 새 토큰을 저장할 데가 없어서 다음 요청에 또 만료된 토큰으로 시작한다.
// 미들웨어는 응답에 쿠키를 쓸 수 있어서 갱신 결과가 남는다.
//
// 부수 효과로 **동시 갱신 경쟁도 막힌다.** 한 페이지의 RSC 여러 개가 병렬로 fetch하다
// 동시에 만료를 만나면 재발급이 여러 번 나가는데, BE가 refreshToken을 회전시키면
// 그중 일부가 실패한다. 여기서 한 번만 갱신하면 그 상황이 생기지 않는다.
//
// ⚠️ 여기서 토큰을 **검증하지 않는다.** 서명 검증은 Spring이 한다(`auth/tokens.ts` 참고).
// zod·검증 라이브러리를 들이지 않는 것도 Edge 번들을 가볍게 두기 위해서다.

import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  AUTH_COOKIE_OPTIONS,
  extractRefreshToken,
  needsRefresh,
  REFRESH_TOKEN_COOKIE,
  SPRING_REFRESH_COOKIE,
} from "@/app/_lib/api/auth/tokens";

const SPRING_BASE_URL = process.env.SPRING_API_BASE_URL ?? "https://api.marketgo.kro.kr";

interface ReissuedTokens {
  accessToken: string;
  refreshToken: string | null;
}

/**
 * Spring 재발급 직호출.
 *
 * 서버 fetch에는 쿠키 저장소가 없어 `Cookie` 헤더를 손으로 붙인다.
 * `server/auth.ts`에 같은 일을 하는 함수가 있지만, 그쪽은 zod를 끌고 와서
 * Edge 번들이 커진다 — 미들웨어에서는 최소 구현을 따로 둔다.
 */
async function reissueTokens(refreshToken: string): Promise<ReissuedTokens | null> {
  try {
    const response = await fetch(new URL("/api/auth/reissue", SPRING_BASE_URL), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Cookie: `${SPRING_REFRESH_COOKIE}=${refreshToken}`,
      },
      cache: "no-store",
    });
    if (!response.ok) return null;

    const payload: unknown = await response.json();
    const accessToken =
      typeof payload === "object" && payload !== null
        ? (payload as { accessToken?: unknown }).accessToken
        : undefined;
    if (typeof accessToken !== "string" || accessToken.length === 0) return null;

    return {
      accessToken,
      refreshToken: extractRefreshToken(response.headers.getSetCookie()),
    };
  } catch {
    // 네트워크 실패는 세션 만료와 다르다 — 쿠키를 지우지 않고 이번 요청만 그대로 보낸다.
    return null;
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // 비로그인 방문자 — 건드릴 게 없다. 갱신 로직이 게스트 트래픽을 막지 않게 먼저 빠져나간다.
  if (!accessToken && !refreshToken) return NextResponse.next();

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!needsRefresh(accessToken, nowSeconds)) return NextResponse.next();

  // 갱신이 필요한데 수단이 없다 = 세션 종료. 낡은 쿠키를 남기면 매 요청이 401로 실패한다.
  if (!refreshToken) {
    const expired = NextResponse.next();
    expired.cookies.delete(ACCESS_TOKEN_COOKIE);
    return expired;
  }

  const tokens = await reissueTokens(refreshToken);

  if (!tokens) {
    const signedOut = NextResponse.next();
    signedOut.cookies.delete(ACCESS_TOKEN_COOKIE);
    signedOut.cookies.delete(REFRESH_TOKEN_COOKIE);
    return signedOut;
  }

  // 요청 쿠키까지 바꿔야 **이번 렌더의 RSC가** 새 토큰을 읽는다.
  // 응답 쿠키만 세팅하면 다음 요청부터 적용돼 이번 화면은 만료된 토큰으로 그려진다.
  request.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken);
  if (tokens.refreshToken) request.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken);

  const response = NextResponse.next({ request });
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, AUTH_COOKIE_OPTIONS);
  if (tokens.refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, AUTH_COOKIE_OPTIONS);
  }
  return response;
}

// TODO(✍️): 로그인이 필요한 화면의 접근 제어(미로그인 → 로그인 화면)는 아직 넣지 않았다.
// 비회원이 어디까지 쓸 수 있는지가 미정이라(BE 요청 3번), 지금 막으면 근거 없는 제약이 된다.
// 정해지면 이 파일에 리다이렉트 분기를 추가한다.

export const config = {
  matcher: [
    /*
     * 갱신이 필요한 요청에만 돈다. 제외:
     * - `api/auth/*`  재발급 라우트 자신 (무한 루프 방지)
     * - `_next/*`     빌드 산출물
     * - `fonts`·정적 파일 — 쿠키와 무관한데 미들웨어를 태우면 응답만 느려진다
     */
    "/((?!api/auth|_next/static|_next/image|fonts|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
