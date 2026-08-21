"use client";

import { useRouter } from "next/navigation";
import { FigmaIcon } from "@/app/_lib/figma-asset";

export function StoreDetailBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="가게 지도로 돌아가기"
      onClick={() => router.back()}
      className="flex size-12 shrink-0 items-center justify-center text-content-primary"
    >
      <FigmaIcon name="chevron-left" width={24} />
    </button>
  );
}
