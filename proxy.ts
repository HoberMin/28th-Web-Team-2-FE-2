// 토큰 갱신 — RSC 렌더 **전에** 도는 유일한 지점.
//
// 파일명이 `proxy.ts`인 이유: Next 16에서 `middleware` 컨벤션이 **`proxy`로 이름이 바뀌었다.**
// `middleware.ts`로 두면 deprecated 경고가 뜬다. export 이름도 `proxy`여야 한다.
// Next 16의 Proxy 런타임은 **Node.js로 고정**이며 Edge runtime을 지원하지 않는다.
//
// 왜 여기냐: Server Component는 쿠키를 **읽을 수만 있고 쓸 수 없다.** RSC 안에서 재발급을
// 받아봐야 새 토큰을 저장할 데가 없어서 다음 요청에 또 만료된 토큰으로 시작한다.
// 미들웨어는 응답에 쿠키를 쓸 수 있어서 갱신 결과가 남는다.
//
// 갱신을 **한 요청당 1회**로 줄여준다 — 한 페이지의 RSC 여러 개가 각자 재발급을 부르는
// 상황은 생기지 않는다. 다만 브라우저가 병렬로 보내는 요청(프리페치 + 내비게이션, 여러 탭)은
// 각각 이 파일을 태우므로 **요청 간 경쟁까지 막지는 못한다.**
// TODO(✍️): BE가 refreshToken을 회전시키는지 확인 중(`농산물-문서/be-요청사항.md` C표).
// 회전한다면 진 쪽이 401을 받으므로 짧은 락이나 재시도가 필요해진다.
//
// ⚠️ 여기서 토큰을 **검증하지 않는다.** 서명 검증은 Spring이 한다(`auth/tokens.ts` 참고).
// zod·검증 라이브러리를 들이지 않는 것도 모든 요청이 지나는 경로를 가볍게 두기 위해서다.

import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_COOKIE_OPTIONS,
  BACKOFF_COOKIE_OPTIONS,
  extractRefreshToken,
  needsRefresh,
  REFRESH_COOKIE_OPTIONS,
  REISSUE_BACKOFF_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SPRING_REFRESH_COOKIE,
} from "@/app/_lib/api/auth/tokens";
import {
  getSpringBaseUrl,
  SPRING_REQUEST_TIMEOUT_MS,
} from "@/app/_lib/api/spring-config";

/**
 * 재발급 결과. **인증 실패와 통신 실패를 반드시 구분한다** — 둘을 뭉치면
 * Spring이 잠깐 죽었을 때 로그인 사용자 전원의 refreshToken까지 지워버린다.
 */
type ReissueOutcome =
  | { status: "renewed"; accessToken: string; refreshToken: string | null }
  /** 서버가 거절했다 — 세션이 끝난 것이므로 쿠키를 지운다. */
  | { status: "rejected" }
  /** 서버에 닿지 못했거나 응답이 이상하다 — 세션은 살아 있을 수 있으니 건드리지 않는다. */
  | { status: "unreachable" };

/**
 * Spring 재발급 직호출. (여기서 부르는 `/api/auth/reissue`는 **Spring 쪽** 경로다.
 * 우리 BFF에도 같은 경로가 있지만 base URL이 달라 서로 다른 엔드포인트다.)
 *
 * 서버 fetch에는 쿠키 저장소가 없어 `Cookie` 헤더를 손으로 붙인다.
 * `server/auth.ts`에 같은 일을 하는 함수가 있지만, 그쪽은 zod를 끌고 와서
 * 모든 요청이 지나는 Proxy 경로가 커진다 — 여기서는 최소 구현을 따로 둔다.
 */
async function reissueTokens(refreshToken: string): Promise<ReissueOutcome> {
  // 환경변수 오류는 통신 실패가 아니라 배포 설정 버그다. catch 밖에서 검증해 숨기지 않는다.
  const reissueUrl = new URL("/api/auth/reissue", getSpringBaseUrl());
  let response: Response;
  try {
    response = await fetch(reissueUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Cookie: `${SPRING_REFRESH_COOKIE}=${refreshToken}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(SPRING_REQUEST_TIMEOUT_MS),
    });
  } catch {
    return { status: "unreachable" };
  }

  // **세션 종료로 보는 건 401·403뿐이다.** 나머지는 전부 서버 사정으로 취급한다 —
  // 경로가 바뀌어 404가 나거나 레이트리밋 429가 떴다고 로그인 사용자를 로그아웃시키면
  // 이 분리를 만든 이유가 무색해진다.
  if (response.status === 401 || response.status === 403) return { status: "rejected" };
  if (!response.ok) return { status: "unreachable" };

  try {
    const payload: unknown = await response.json();
    const accessToken =
      typeof payload === "object" && payload !== null
        ? (payload as { accessToken?: unknown }).accessToken
        : undefined;
    // 200인데 토큰이 없다 = 우리가 모르는 상태. 세션을 지우기보다 이번 요청만 넘긴다.
    if (typeof accessToken !== "string" || accessToken.length === 0) {
      return { status: "unreachable" };
    }
    return {
      status: "renewed",
      accessToken,
      refreshToken: extractRefreshToken(response.headers.getSetCookie()),
    };
  } catch {
    return { status: "unreachable" };
  }
}

/**
 * 세션 종료 — 요청·응답 쿠키를 **둘 다** 지운다.
 * 응답 쿠키만 지우면 이번 렌더의 RSC가 죽은 토큰을 그대로 읽어 401 에러 화면이 뜬다.
 */
function shouldRedirectToOnboarding(request: NextRequest): boolean {
  return (
    request.nextUrl.pathname !== "/onboarding" &&
    !request.nextUrl.pathname.startsWith("/api/") &&
    (request.headers.get("accept")?.includes("text/html") === true ||
      request.headers.get("RSC") === "1")
  );
}

function signOut(
  request: NextRequest,
  alsoRefresh: boolean,
  redirectToOnboarding = false,
): NextResponse {
  request.cookies.delete(ACCESS_TOKEN_COOKIE);
  if (alsoRefresh) request.cookies.delete(REFRESH_TOKEN_COOKIE);

  const response = redirectToOnboarding
    ? NextResponse.redirect(new URL("/onboarding", request.url))
    : NextResponse.next({ request });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  if (alsoRefresh) response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // 비로그인 방문자 — 건드릴 게 없다. 갱신 로직이 게스트 트래픽을 막지 않게 먼저 빠져나간다.
  if (!accessToken && !refreshToken) return NextResponse.next();

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!needsRefresh(accessToken, nowSeconds)) return NextResponse.next();

  // 직전 재발급이 회복 불가로 실패했다 — 쉬는 동안은 시도하지 않는다.
  // 없으면 매 페이지뷰마다 Spring에 실패할 POST를 한 건씩 쏜다(탭·프리페치만큼 배수).
  if (request.cookies.has(REISSUE_BACKOFF_COOKIE)) return NextResponse.next();

  // 갱신이 필요한데 수단이 없다 = 세션 종료. 낡은 쿠키를 남기면 매 요청이 401로 실패한다.
  if (!refreshToken) return signOut(request, false, shouldRedirectToOnboarding(request));

  const outcome = await reissueTokens(refreshToken);

  // 서버에 닿지 못했다 — 세션은 멀쩡할 수 있으므로 쿠키를 건드리지 않는다.
  // 다만 곧바로 또 시도하지 않도록 백오프를 심는다(무한 재시도 방지).
  if (outcome.status === "unreachable") {
    const backedOff = NextResponse.next();
    backedOff.cookies.set(REISSUE_BACKOFF_COOKIE, "1", BACKOFF_COOKIE_OPTIONS);
    return backedOff;
  }

  if (outcome.status === "rejected") {
    return signOut(request, true, shouldRedirectToOnboarding(request));
  }

  // 요청 쿠키까지 바꿔야 **이번 렌더의 RSC가** 새 토큰을 읽는다.
  // 응답 쿠키만 세팅하면 다음 요청부터 적용돼 이번 화면은 만료된 토큰으로 그려진다.
  request.cookies.set(ACCESS_TOKEN_COOKIE, outcome.accessToken);
  if (outcome.refreshToken) request.cookies.set(REFRESH_TOKEN_COOKIE, outcome.refreshToken);

  const response = NextResponse.next({ request });
  response.cookies.delete(REISSUE_BACKOFF_COOKIE);
  response.cookies.set(ACCESS_TOKEN_COOKIE, outcome.accessToken, ACCESS_COOKIE_OPTIONS);
  if (outcome.refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, outcome.refreshToken, REFRESH_COOKIE_OPTIONS);
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
    "/((?!api/auth/|_next/static|_next/image|fonts|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
