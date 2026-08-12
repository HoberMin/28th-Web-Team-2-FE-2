"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  function handleRegionComplete(district: string) {
    setOnboarding({ district, completed: true });
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

  return <RegionStep defaultValue={onboarding.district} onComplete={handleRegionComplete} />;
}
