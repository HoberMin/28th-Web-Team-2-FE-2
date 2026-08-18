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

// 참고: `isSignedIn()` 같은 편의 헬퍼를 일부러 두지 않았다. 이름이 편해서 헤더·레이아웃에서
// 부르고 싶어지는데, 그게 **앱 전체가 Full Route Cache를 잃는** 경로다(`auth-session` §5).
// 로그인 여부가 필요한 화면이 생기면 배치를 같이 판단해서 넣는다.

async function saveTokens(tokens: SpringTokens, clearMissingRefreshToken: boolean): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, ACCESS_COOKIE_OPTIONS);
  if (tokens.refreshToken) {
    store.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
  } else if (clearMissingRefreshToken) {
    store.delete(REFRESH_TOKEN_COOKIE);
  }
}

/**
 * 로그인으로 발급받은 토큰을 저장한다.
 *
 * 새 로그인 응답에 refreshToken이 없으면 이전 사용자의 refreshToken을 반드시 지운다.
 * 남겨두면 accessToken 만료 뒤 이전 계정 세션으로 돌아갈 수 있다.
 */
export function saveLoginTokens(tokens: SpringTokens): Promise<void> {
  return saveTokens(tokens, true);
}

/**
 * 재발급으로 받은 토큰을 저장한다.
 *
 * refreshToken을 회전하지 않는 응답이면 기존 refreshToken을 유지한다.
 */
export function saveReissuedTokens(tokens: SpringTokens): Promise<void> {
  return saveTokens(tokens, false);
}

export async function clearTokens(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}
