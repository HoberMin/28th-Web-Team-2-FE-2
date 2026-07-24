"use client";

// 홈 진입 게이트 — 온보딩 미완료면 온보딩 화면으로 리다이렉트.
// 마운트 후(하이드레이션 완료 후)에만 체크해 SSR/CSR 불일치를 피한다.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { readOnboarding } from "../_lib/onboarding-store";

export function OnboardingGate() {
  const router = useRouter();

  useEffect(() => {
    if (!readOnboarding().completed) {
      router.replace("/prototype/onboarding");
    }
  }, [router]);

  return null;
}
