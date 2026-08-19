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

// GET /api/v1/users/me — 현재 사용자 조회 (2026-08-19 BE 신설, 농산물-문서/be-요청사항.md 1번 해소).
//
// envelope 없이 DTO 그대로 온다. required 필드가 스펙에 명시돼 있지 않아 아주 초기 유저는
// nickname·currentRegion이 비어 있을 수 있다 — 방어적으로 optional/nullable로 파싱한다.
// 401/403/404도 같은 스키마 형태로 선언돼 있지만 body를 신뢰하지 않고 status로 분기한다
// (`backend-api-reference` §2).

export const onboardingStepSchema = z.enum(["NICKNAME", "REGION", "COMPLETED"]);
export type OnboardingStep = z.infer<typeof onboardingStepSchema>;

export const userMeResponseSchema = z.object({
  nickname: z.string().optional().nullable(),
  currentRegion: z
    .object({
      regionId: z.string(),
      regionName: z.string(),
    })
    .optional()
    .nullable(),
  onboardingStep: onboardingStepSchema,
});
export type UserMeResponse = z.infer<typeof userMeResponseSchema>;
