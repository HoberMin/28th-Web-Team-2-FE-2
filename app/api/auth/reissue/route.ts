// BFF — accessToken 재발급.
//
// 평상시 갱신은 `middleware.ts`가 렌더 전에 처리하므로 이 라우트는 잘 안 불린다.
// 남겨두는 이유는 클라이언트 인터랙션(폼 제출 등)이 401을 만났을 때 쓸 복구 경로가 필요해서다.

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
  } catch {
    // 재발급 실패 = 세션 끝. 낡은 쿠키를 남겨두면 매 요청마다 실패를 반복한다.
    await clearTokens();
    return Response.json({ message: "다시 로그인해 주세요." }, { status: 401 });
  }
}
