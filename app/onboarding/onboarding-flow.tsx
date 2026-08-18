"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveSelectedRegionAPI } from "@/app/_lib/api/client/regions";
import type { Region } from "@/app/_lib/api/schemas/regions";
import { startKakaoLogin } from "@/app/_lib/kakao-auth";
import { setOnboarding, useOnboarding } from "@/app/_lib/onboarding-store";
import { ROUTES } from "@/app/_lib/routes";
import { IntroStep } from "./steps/intro-step";
import { NicknameStep } from "./steps/nickname-step";
import { RegionStep } from "./steps/region-step";

export function OnboardingFlow() {
  const router = useRouter();
  const onboarding = useOnboarding();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    if (onboarding.completed) {
      router.replace(ROUTES.home);
    }
  }, [onboarding.completed, router]);

  async function handleKakaoLogin() {
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    setLoginError("");

    try {
      const result = await startKakaoLogin();
      setOnboarding({ authProvider: "kakao" });

      if (result.isNew) {
        return;
      }

      setOnboarding({ completed: true });
      router.replace(ROUTES.home);
    } catch {
      setLoginError("로그인하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleNicknameComplete(nickname: string) {
    setOnboarding({ nickname });
  }

  async function handleRegionComplete(region: Region) {
    await saveSelectedRegionAPI(region);

    // 기존 prototype 소비자는 짧은 동 이름을 키로 사용한다. Spring의 전체 이름도 별도로 보존한다.
    const district = region.regionName.split(" ").at(-1) ?? region.regionName;
    setOnboarding({
      district,
      regionId: region.regionId,
      regionName: region.regionName,
      completed: true,
    });
    router.replace(ROUTES.home);
  }

  if (onboarding.completed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-primary" role="status">
        <span className="sr-only">홈으로 이동하는 중</span>
      </div>
    );
  }

  if (!onboarding.authProvider) {
    return (
      <IntroStep
        error={loginError}
        isLoading={isLoggingIn}
        onKakaoLogin={handleKakaoLogin}
      />
    );
  }

  if (!onboarding.nickname) {
    return <NicknameStep defaultValue={onboarding.nickname} onComplete={handleNicknameComplete} />;
  }

  const defaultRegion =
    onboarding.regionId && onboarding.regionName
      ? { regionId: onboarding.regionId, regionName: onboarding.regionName }
      : null;

  return <RegionStep defaultValue={defaultRegion} onComplete={handleRegionComplete} />;
}
