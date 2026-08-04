"use client";

// 홈 진입 게이트 — 온보딩 미완료면 멈춘 자리로 리다이렉트.
// 마운트 후(하이드레이션 완료 후)에만 체크해 SSR/CSR 불일치를 피한다.
//
// 목적지는 두 갈래다(F00-0 §재진입): 로그인/둘러보기를 아직 안 고르면 소개 화면(F00-0),
// 골랐지만 동네가 없으면 온보딩(F00-1/F00-2). 판정은 nextOnboardingRoute가 갖고 있다.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { nextOnboardingRoute, readOnboarding } from "../_lib/onboarding-store";

export function OnboardingGate() {
  const router = useRouter();

  useEffect(() => {
    const next = nextOnboardingRoute(readOnboarding());
    if (next) router.replace(next);
  }, [router]);

  return null;
}
