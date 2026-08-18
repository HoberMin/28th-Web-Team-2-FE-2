// PATCH /api/v1/users/me — 닉네임 저장
//
// 제약은 스펙 그대로 옮겼다: 2~10자, 한글·영문·숫자만(공백·기호 불가).
// 중복이면 409가 온다.

import { z } from "zod";
import { NICKNAME_MAX, NICKNAME_MIN, NICKNAME_PATTERN } from "@/app/_lib/nickname";

export const nicknameSchema = z
  .string()
  .min(NICKNAME_MIN, `닉네임은 ${NICKNAME_MIN}자 이상이어야 해요.`)
  .max(NICKNAME_MAX, `닉네임은 ${NICKNAME_MAX}자까지 쓸 수 있어요.`)
  .regex(NICKNAME_PATTERN, "한글, 영문, 숫자만 쓸 수 있어요.");

export const updateNicknameRequestSchema = z.object({ nickname: nicknameSchema });
export type UpdateNicknameRequest = z.infer<typeof updateNicknameRequestSchema>;

// TODO(✍️): 현재 사용자를 **조회하는** API가 없다(PATCH만 있다). 그래서
// 마이페이지에 내 닉네임을 띄울 수 없고, 재방문자가 온보딩을 마쳤는지도 알 수 없다.
// BE에 `GET /api/v1/users/me` 신설을 요청해 뒀다 (`농산물-문서/be-요청사항.md` 1번).
// 응답 스키마는 답이 온 뒤에 만든다 — 지금 추측해서 만들면 틀린 모양이 굳는다.
