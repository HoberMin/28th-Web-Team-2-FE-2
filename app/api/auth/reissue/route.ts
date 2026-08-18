// BFF — accessToken 재발급.
//
// 평상시 갱신은 `proxy.ts`가 렌더 전에 처리하므로 이 라우트는 잘 안 불린다.
// 남겨두는 이유는 클라이언트 인터랙션(폼 제출 등)이 401을 만났을 때 쓸 복구 경로가 필요해서다.

import { ApiError } from "@/app/_lib/api/api-error";
import { clearTokens, getRefreshToken, saveTokens } from "@/app/_lib/api/auth/session";
import { reissue } from "@/app/_lib/api/server/auth";

export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return Response.json({ message: "다시 로그인해 주세요." }, { status: 401 });
  }

  try {
    await saveTokens(await reissue(refreshToken));
    return Response.json({ ok: true });
  } catch (error) {
    // **통신 실패와 세션 만료를 구분한다** — `proxy.ts`와 같은 규칙이다.
    // 5xx·타임아웃까지 세션으로 취급하면 Spring이 잠깐 죽었을 때 로그인 사용자 전원이
    // refreshToken까지 잃고 재로그인하게 된다. 서버 사정은 재시도로 회복된다.
    const rejected =
      error instanceof ApiError && (error.isAuthExpired || error.kind === "forbidden");

    if (!rejected) {
      return Response.json({ message: "잠시 후 다시 시도해 주세요." }, { status: 503 });
    }

    // 서버가 거절했다 = 세션 끝. 낡은 쿠키를 남기면 매 요청마다 실패를 반복한다.
    await clearTokens();
    return Response.json({ message: "다시 로그인해 주세요." }, { status: 401 });
  }
}
