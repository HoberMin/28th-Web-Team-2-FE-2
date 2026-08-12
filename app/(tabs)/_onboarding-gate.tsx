"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { nextOnboardingRoute, useOnboarding } from "@/app/_lib/onboarding-store";

export function OnboardingGate() {
  const router = useRouter();
  const onboarding = useOnboarding();
  const target = nextOnboardingRoute(onboarding);

  useEffect(() => {
    if (target) {
      router.replace(target);
    }
  }, [router, target]);

  if (!target) return null;

  return (
    <div className="absolute inset-0 z-50 bg-surface-primary" role="status">
      <span className="sr-only">온보딩 상태를 확인하는 중</span>
    </div>
  );
}
