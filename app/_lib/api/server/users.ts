import "server-only";

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

// TODO(✍️): getMe() — 현재 사용자 조회. **엔드포인트가 아직 없다.**
// 스펙에 PATCH만 있고 GET이 없어서, 닉네임 표시·온보딩 완료 여부 판단·세션 유효성 확인을
// 전부 못 하는 상태다. BE 요청 1번(`농산물-문서/be-요청사항.md`)의 답이 오면 여기 추가한다.
// 추측으로 미리 만들지 않는다 — 틀린 모양이 굳으면 화면까지 따라 틀어진다.
