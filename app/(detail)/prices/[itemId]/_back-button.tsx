"use client";

import { useRouter } from "next/navigation";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "@/app/_lib/routes";

export function PriceDetailBackButton() {
  const router = useRouter();

  const handleBack = () => {
    const referrer = document.referrer ? new URL(document.referrer) : null;
    if (referrer?.origin === window.location.origin) {
      router.back();
      return;
    }
    router.push(ROUTES.prices);
  };

  return (
    <button
      type="button"
      aria-label="야채 시세 목록으로 돌아가기"
      onClick={handleBack}
      className="flex size-12 shrink-0 items-center justify-center text-content-primary"
    >
      <FigmaIcon name="chevron-left" width={24} />
    </button>
  );
}
