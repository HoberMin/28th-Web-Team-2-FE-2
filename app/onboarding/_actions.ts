"use server";

import { ApiError } from "@/app/_lib/api/api-error";
import { clearTokens, getAccessToken } from "@/app/_lib/api/auth/session";
import { updateNicknameRequestSchema } from "@/app/_lib/api/schemas/users";
import { updateNickname } from "@/app/_lib/api/server/users";

export type SaveNicknameResult =
  | { ok: true }
  | { ok: false; message: string; reason: "conflict" | "invalid" | "signedOut" | "unavailable" };

export async function saveNicknameAction(nickname: string): Promise<SaveNicknameResult> {
  const parsed = updateNicknameRequestSchema.safeParse({ nickname });
  if (!parsed.success) {
    return { ok: false, reason: "invalid", message: parsed.error.issues[0]?.message ?? "닉네임을 확인해 주세요." };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "signedOut", message: "로그인이 만료됐어요. 다시 로그인해 주세요." };
  }

  try {
    await updateNickname({ nickname: parsed.data.nickname, token });
    return { ok: true };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.kind === "conflict") {
      return { ok: false, reason: "conflict", message: "이미 사용 중인 닉네임이에요." };
    }
    if (error.kind === "badRequest") {
      return { ok: false, reason: "invalid", message: "닉네임 형식을 확인해 주세요." };
    }
    if (error.kind === "unauthorized" || error.kind === "forbidden") {
      await clearTokens();
      return { ok: false, reason: "signedOut", message: "로그인이 만료됐어요. 다시 로그인해 주세요." };
    }
    return { ok: false, reason: "unavailable", message: "닉네임을 저장하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
}
