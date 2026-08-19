"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { registerCurrentRegionAPI, saveSelectedRegionAPI } from "@/app/_lib/api/client/regions";
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
  /** 로그인 설정 실패 사유(키 이름만, 값 없음) — 서버 로그 접근 없이 브라우저 콘솔로 확인하기 위함. */
  initialLoginDebug: string;
  isAuthenticated: boolean;
  /**
   * `page.tsx`가 서버에서 직접 `getMe`를 불러 확인한 값(위조 불가) — `REGION`이면 닉네임은
   * 서버에 이미 저장돼 있으니 닉네임 단계를 건너뛰고 지역 선택부터 시작한다.
   */
  onboardingStepHint?: "NICKNAME" | "REGION";
  /** 같은 `getMe` 조회로 같이 받은 닉네임. 세션 동기화 시 로컬 스토어를 채우는 데 쓴다. */
  serverNickname?: string;
}

export function OnboardingFlow({
  freshLogin,
  initialLoginError,
  initialLoginDebug,
  isAuthenticated,
  onboardingStepHint,
  serverNickname,
}: OnboardingFlowProps) {
  const router = useRouter();
  const onboarding = useHydratedOnboarding();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(initialLoginError);
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState("");
  // 최초 렌더의 힌트만 쓴다 — 세션 동기화 effect가 로컬 nickname을 비우더라도 이 스킵 여부는
  // 그대로 유지돼야 REGION 힌트로 들어온 사용자가 다시 닉네임 화면을 보지 않는다.
  const [skipNicknameStep] = useState(onboardingStepHint === "REGION");
  const needsSessionSync =
    onboarding !== null &&
    isAuthenticated &&
    (freshLogin || onboarding.authProvider !== "kakao");
  const onboardingCompleted = onboarding?.completed ?? false;

  useEffect(() => {
    if (initialLoginDebug) {
      console.error("[auth] 카카오 로그인 설정 실패", { reason: initialLoginDebug });
    }
  }, [initialLoginDebug]);

  useEffect(() => {
    if (needsSessionSync) {
      // 목업 시절 localStorage를 신규 서비스 계정의 정본으로 쓰지 않는다.
      // 로그인 API에는 isNew가 없으므로 실제 세션이 처음 확인되면 닉네임 API 저장부터 다시 시작한다.
      // 서버가 이미 닉네임을 갖고 있으면(재방문자) 같이 채운다 — 안 그러면 닉네임 단계를
      // 건너뛴 사용자의 로컬 닉네임이 빈 채로 남아 "이웃"처럼 표시된다(`_lib/reports-store.ts`).
      setOnboarding({ authProvider: "kakao", completed: false, nickname: serverNickname ?? "" });
      if (freshLogin) router.replace(ROUTES.onboarding);
    }
  }, [freshLogin, needsSessionSync, router, serverNickname]);

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

    // Spring에도 등록한다 — 이게 없으면 `onboardingStep`이 계정 쪽에서 영영 REGION에 머물러
    // 재방문자 홈 리다이렉트(로그인 콜백)가 도달 못 하는 코드가 된다. 온보딩 화면은
    // 이 지점에 도달했다는 것 자체가 로그인 확정 상태라 401 걱정은 없다.
    // 실패해도 화면 진행은 막지 않는다 — 쿠키(위 saveSelectedRegionAPI)만으로 앱은 이미
    // 정상 동작하고, 여기서 막으면 부가 동기화 실패가 온보딩 완료 자체를 가로막게 된다.
    try {
      await registerCurrentRegionAPI(region);
    } catch (error) {
      console.error("[onboarding] 관심 지역을 Spring에 등록하지 못했어요", error);
    }

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

  if (!onboarding.nickname && !skipNicknameStep) {
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
