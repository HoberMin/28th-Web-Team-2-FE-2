"use client";

import { useRouter } from "next/navigation";
import { AppBar } from "../_lib/shell";
import { FavoriteButton } from "./favorite-button";

// 시세 화면 전용 AppBar — 랭킹·가게·가게 상세 등 여러 경로에서 들어오므로 뒤로가기를
// 고정 목적지(`/prototype`)가 아니라 **온 길**로 보내야 한다(AppBar의 backHref는 고정 목적지 전용).
// 히스토리가 없는 진입(새 탭·직접 링크)이면 홈으로 폴백한다.
export function PriceAppBar({
  vegetableId,
  vegetableName,
}: {
  vegetableId: string;
  vegetableName: string;
}) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/prototype");
    }
  }

  return (
    <AppBar
      onBack={handleBack}
      right={<FavoriteButton vegetableId={vegetableId} vegetableName={vegetableName} size="md" />}
    />
  );
}
