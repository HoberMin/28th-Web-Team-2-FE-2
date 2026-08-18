import { describe, expect, it } from "vitest";
import type { OnboardingState } from "@/app/_lib/onboarding-store";
import { decideOnboardingGate } from "./_onboarding-gate-state";

const COMPLETED_STATE: OnboardingState = {
  authProvider: "kakao",
  nickname: "테스터",
  district: "광진구",
  districts: ["광진구"],
  completed: true,
  avatar: "",
};

describe("decideOnboardingGate", () => {
  it("hydration 중에는 리다이렉트 없이 탭 화면을 가린다", () => {
    expect(decideOnboardingGate(null)).toEqual({
      target: null,
      shouldBlock: true,
    });
  });

  it("완료 상태를 읽으면 현재 탭 화면을 유지한다", () => {
    expect(decideOnboardingGate(COMPLETED_STATE)).toEqual({
      target: null,
      shouldBlock: false,
    });
  });

  it("미완료 상태를 읽으면 온보딩으로 이동할 때까지 화면을 가린다", () => {
    expect(
      decideOnboardingGate({
        ...COMPLETED_STATE,
        completed: false,
      }),
    ).toEqual({
      target: "/onboarding",
      shouldBlock: true,
    });
  });
});
