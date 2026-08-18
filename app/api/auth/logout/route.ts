// BFF — 로그아웃. Spring 쪽 refreshToken을 폐기하고 우리 쿠키를 지운다.
//
// 서버 폐기가 실패해도 **우리 쿠키는 반드시 지운다** — 로그아웃이 서버 사정으로
// 막히면 사용자는 로그아웃할 방법이 없어진다.

import { crossOriginResponse } from "@/app/_lib/api/auth/request-origin";
import { clearTokens, getAccessToken, getRefreshToken } from "@/app/_lib/api/auth/session";
import { logout } from "@/app/_lib/api/server/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const originError = crossOriginResponse(request);
  if (originError) return originError;

  const [accessToken, refreshToken] = await Promise.all([getAccessToken(), getRefreshToken()]);

  await logout({ accessToken, refreshToken });
  await clearTokens();

  return Response.json({ ok: true });
}
