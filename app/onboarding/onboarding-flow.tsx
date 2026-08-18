"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveSelectedRegionAPI } from "@/app/_lib/api/client/regions";
import type { Region } from "@/app/_lib/api/schemas/regions";
import { startKakaoLogin } from "@/app/_lib/kakao-auth";
import { setOnboarding, useHydratedOnboarding } from "@/app/_lib/onboarding-store";
import { ROUTES } from "@/app/_lib/routes";
import { saveNicknameAction } from "./_actions";
import { IntroStep } from "./steps/intro-step";
import { NicknameStep } from "./steps/nickname-step";
import { RegionStep } from "./steps/region-step";

interface OnboardingFlowProps {
  freshLogin: boolean;
  initialLoginError: string;
  isAuthenticated: boolean;
}

export function OnboardingFlow({
  freshLogin,
  initialLoginError,
  isAuthenticated,
}: OnboardingFlowProps) {
  const router = useRouter();
  const onboarding = useHydratedOnboarding();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(initialLoginError);
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState("");
  const needsSessionSync =
    onboarding !== null &&
    isAuthenticated &&
    (freshLogin || onboarding.authProvider !== "kakao");
  const onboardingCompleted = onboarding?.completed ?? false;

  useEffect(() => {
    if (needsSessionSync) {
      // 목업 시절 localStorage를 신규 서비스 계정의 정본으로 쓰지 않는다.
      // 로그인 API에는 isNew가 없으므로 실제 세션이 처음 확인되면 닉네임 API 저장부터 다시 시작한다.
      setOnboarding({ authProvider: "kakao", completed: false, nickname: "" });
      if (freshLogin) router.replace(ROUTES.onboarding);
    }
  }, [freshLogin, needsSessionSync, router]);

  useEffect(() => {
    if (isAuthenticated && onboardingCompleted && !needsSessionSync) {
      router.replace(ROUTES.home);
    }
  }, [isAuthenticated, needsSessionSync, onboardingCompleted, router]);

  function handleKakaoLogin() {
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    setLoginError("");

    try {
      startKakaoLogin();
    } catch {
      setLoginError("로그인하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setIsLoggingIn(false);
    }
  }

  async function handleNicknameComplete(nickname: string) {
    if (isSavingNickname) return;
    setIsSavingNickname(true);
    setNicknameError("");
    try {
      const result = await saveNicknameAction(nickname);
      if (!result.ok) {
        setNicknameError(result.message);
        if (result.reason === "signedOut") {
          setOnboarding({ authProvider: "" });
          router.refresh();
        }
        return;
      }
      setOnboarding({ nickname });
    } catch {
      setNicknameError("닉네임을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSavingNickname(false);
    }
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

  if (onboarding === null || needsSessionSync) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-primary" role="status">
        <span className="sr-only">로그인을 적용하는 중</span>
      </div>
    );
  }

  if (isAuthenticated && onboarding.completed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-primary" role="status">
        <span className="sr-only">홈으로 이동하는 중</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <IntroStep
        error={loginError}
        isLoading={isLoggingIn}
        onKakaoLogin={handleKakaoLogin}
      />
    );
  }

  if (!onboarding.nickname) {
    return (
      <NicknameStep
        defaultValue={onboarding.nickname}
        isLoading={isSavingNickname}
        serverError={nicknameError}
        onValueChange={() => setNicknameError("")}
        onComplete={handleNicknameComplete}
      />
    );
  }

  const defaultRegion =
    onboarding.regionId && onboarding.regionName
      ? { regionId: onboarding.regionId, regionName: onboarding.regionName }
      : null;

  return <RegionStep defaultValue={defaultRegion} onComplete={handleRegionComplete} />;
}
