import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/app/_lib/api/api-error";

const mocks = vi.hoisted(() => ({
  clearTokens: vi.fn(),
  getAccessToken: vi.fn(),
  updateNickname: vi.fn(),
}));

vi.mock("@/app/_lib/api/auth/session", () => ({
  clearTokens: mocks.clearTokens,
  getAccessToken: mocks.getAccessToken,
}));
vi.mock("@/app/_lib/api/server/users", () => ({ updateNickname: mocks.updateNickname }));

import { saveNicknameAction } from "./_actions";

describe("saveNicknameAction", () => {
  beforeEach(() => {
    mocks.getAccessToken.mockReset();
    mocks.clearTokens.mockReset();
    mocks.clearTokens.mockResolvedValue(undefined);
    mocks.updateNickname.mockReset();
  });

  it("닉네임 형식을 서버와 같은 스키마로 먼저 검증한다", async () => {
    await expect(saveNicknameAction("공백 닉네임")).resolves.toMatchObject({ ok: false, reason: "invalid" });
    expect(mocks.getAccessToken).not.toHaveBeenCalled();
  });

  it("세션이 없으면 Spring PATCH를 호출하지 않는다", async () => {
    mocks.getAccessToken.mockResolvedValueOnce(undefined);

    await expect(saveNicknameAction("장보고")).resolves.toMatchObject({ ok: false, reason: "signedOut" });
    expect(mocks.updateNickname).not.toHaveBeenCalled();
  });

  it("accessToken으로 닉네임을 no-store PATCH helper에 전달한다", async () => {
    mocks.getAccessToken.mockResolvedValueOnce("service-access");
    mocks.updateNickname.mockResolvedValueOnce(undefined);

    await expect(saveNicknameAction("장보고123")).resolves.toEqual({ ok: true });
    expect(mocks.updateNickname).toHaveBeenCalledWith({ nickname: "장보고123", token: "service-access" });
  });

  it.each([
    [409, "conflict", "conflict"],
    [400, "badRequest", "invalid"],
    [401, "unauthorized", "signedOut"],
    [503, "upstream", "unavailable"],
  ] as const)("Spring %i(%s)를 사용자 처리 가능한 %s 결과로 바꾼다", async (status, kind, reason) => {
    mocks.getAccessToken.mockResolvedValueOnce("service-access");
    mocks.updateNickname.mockRejectedValueOnce(
      new ApiError({ kind, status, endpoint: "PATCH /api/v1/users/me" }),
    );

    await expect(saveNicknameAction("장보고")).resolves.toMatchObject({ ok: false, reason });
    expect(mocks.clearTokens).toHaveBeenCalledTimes(kind === "unauthorized" ? 1 : 0);
  });

  it("프로그래밍 오류는 숨기지 않는다", async () => {
    mocks.getAccessToken.mockResolvedValueOnce("service-access");
    mocks.updateNickname.mockRejectedValueOnce(new TypeError("bug"));

    await expect(saveNicknameAction("장보고")).rejects.toThrow("bug");
  });
});
