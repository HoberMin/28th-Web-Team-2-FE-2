import "server-only";

import { cookies } from "next/headers";
import type { SpringTokens } from "../server/auth";
import {
  ACCESS_COOKIE_OPTIONS,
  ACCESS_TOKEN_COOKIE,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE,
} from "./tokens";

/**
 * RSC·Server Action에서 현재 accessToken을 읽는다.
 *
 * ⚠️ `cookies()`를 호출하는 순간 그 라우트는 **동적 렌더링으로 전환**된다.
 * 로그인 상태가 필요 없는 화면에서는 부르지 않는다 — 정적 렌더링을 공짜로 잃는다.
 *
 * 갱신은 여기서 하지 않는다. Server Component는 쿠키를 **쓸 수 없어서** 갱신 결과를
 * 저장할 데가 없기 때문이다. 그래서 갱신은 렌더 전에 도는 `proxy.ts`가 맡는다.
 */
export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
}

/** 로그인 여부. 토큰 존재만 본다 — 유효성은 서버 응답(401)이 판정한다. */
export async function isSignedIn(): Promise<boolean> {
  return Boolean(await getAccessToken());
}

/**
 * 발급받은 토큰을 우리 도메인 쿠키에 심는다.
 *
 * **Route Handler나 Server Action에서만 호출된다** — RSC에서는 쿠키를 쓸 수 없다.
 * 재발급 시 refreshToken이 안 내려오면(무회전) 기존 값을 유지한다.
 */
export async function saveTokens(tokens: SpringTokens): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, ACCESS_COOKIE_OPTIONS);
  if (tokens.refreshToken) {
    store.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
  }
}

export async function clearTokens(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}
