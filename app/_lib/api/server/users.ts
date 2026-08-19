import "server-only";

import { userMeResponseSchema, type UserMeResponse } from "../schemas/users";
import { springFetch } from "../spring";

/**
 * 닉네임 저장. 204라 본문이 없다.
 *
 * 실패 분기(`ApiError.kind`):
 * - `conflict`(409) — 이미 쓰는 닉네임
 * - `badRequest`(400) — 형식 위반 (2~10자, 한글·영문·숫자)
 * - `unauthorized`(401) — 로그인 필요
 */
export async function updateNickname(params: { nickname: string; token: string }): Promise<void> {
  await springFetch({
    path: "/api/v1/users/me",
    method: "PATCH",
    body: { nickname: params.nickname },
    token: params.token,
    cache: "no-store",
  });
}

/**
 * 현재 사용자 조회 — 닉네임·현재 관심 지역·온보딩 진행 단계.
 *
 * 응답에 개인화 필드가 섞여 있어 `no-store`다(`auth-session` §5).
 */
export function getMe(token: string): Promise<UserMeResponse> {
  return springFetch({
    path: "/api/v1/users/me",
    token,
    schema: userMeResponseSchema,
    cache: "no-store",
  });
}
