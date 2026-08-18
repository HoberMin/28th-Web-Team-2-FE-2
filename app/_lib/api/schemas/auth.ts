// 인증 — 카카오 OIDC idToken을 넘겨 서비스 토큰을 받는다.
//
// 로그인 응답 본문에는 accessToken만 있고, refreshToken은 **Set-Cookie로 내려온다**
// (스펙에는 문서화돼 있지 않고 `kakao_login.md`에만 적혀 있다 — BE 확인 요청 중).

import { z } from "zod";

/** 지금은 kakao 하나. 다른 provider가 생기면 여기에 추가한다. */
export const AUTH_PROVIDERS = ["kakao"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const MAX_KAKAO_ID_TOKEN_LENGTH = 8_192;

/** 카카오 access_token이 아니라 **OIDC id_token**을 보낸다. 헷갈리기 쉬운 지점. */
export const loginRequestSchema = z.object({
  idToken: z
    .string()
    .min(1)
    .max(MAX_KAKAO_ID_TOKEN_LENGTH)
    .refine((value) => value.trim().length > 0),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const tokenResponseSchema = z.object({
  accessToken: z.string().min(1),
});
export type TokenResponse = z.infer<typeof tokenResponseSchema>;

// TODO(✍️): 신규/기존 회원 구분 수단이 없다. 로그인 응답이 accessToken뿐이라
// 온보딩으로 보낼지 홈으로 보낼지 판단할 데이터가 없는 상태다.
// BE에 `GET /users/me` 신설 또는 로그인 응답의 `isNew` 추가를 요청해 뒀다
// (`농산물-문서/be-요청사항.md` 1번). 답이 오면 여기에 필드를 추가한다.
