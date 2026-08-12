import type { Metadata } from "next";
import { OnboardingFlow } from "./onboarding-flow";

export const metadata: Metadata = {
  title: "온보딩 | 장보고",
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
