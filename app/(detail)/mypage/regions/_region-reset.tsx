"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/app/_components/button";
import { LoadingCircular } from "@/app/_components/loading-circular";
import { districtNameOf, useCurrentRegionDetection } from "@/app/onboarding/steps/use-current-region";
import { resetCurrentRegionAction } from "./_actions";

// 현재 위치로 동네를 다시 잡는 유일한 조작. 온보딩 지역 단계와 **같은 탐색 훅**을 쓴다
// (`use-current-region.ts`) — 두 화면의 판정 규칙이 갈리지 않게 하려는 것이고, 이전 구현도
// 온보딩 훅을 그대로 재사용하고 있었다.
//
// 마운트 즉시 위치를 묻지 않는다(`enabled: false`) — 설정 화면에 들어오기만 해도 권한 프롬프트가
// 뜨는 건 사용자가 요청하지 않은 동작이다. 버튼을 누르면 그때 탐색이 시작된다.

export function RegionReset() {
  const router = useRouter();
  // 탐색 훅은 한 번 돌면 결과를 계속 들고 있으므로, 확인을 끝낸 뒤 대기 화면으로 돌아오려면
  // 화면 단계를 따로 들고 있어야 한다.
  const [phase, setPhase] = useState<"idle" | "active">("idle");
  const { state, redetect } = useCurrentRegionDetection({ enabled: false });
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleStart() {
    setMessage("");
    setPhase("active");
    // 첫 실행도 재탐색과 같은 경로로 시작한다(훅은 `enabled: false`로 대기 중이다).
    redetect();
  }

  function handleConfirm() {
    const region = state.region;
    if (!region) return;

    const district = districtNameOf(region);
    setMessage("");
    startTransition(async () => {
      const result = await resetCurrentRegionAction(region);
      if (result.ok) {
        setPhase("idle");
        setMessage(`${district}으로 설정했어요.`);
        router.refresh();
        return;
      }
      setMessage(result.message);
    });
  }

  if (phase === "active" && state.status === "detecting") {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <LoadingCircular animate className="size-6 text-content-brand-medium" currentColor />
        <p className="text-body-14-medium text-content-secondary" role="status">
          지금 계신 동네를 탐색 중이에요
        </p>
      </div>
    );
  }

  if (phase === "active" && state.status === "confirming" && state.region) {
    const district = districtNameOf(state.region);
    return (
      <div className="flex flex-col gap-3 py-4">
        <p className="text-title-18-bold text-content-primary">
          위치를 확인했어요. {district}이 맞나요?
        </p>
        <p className="text-body-14-regular text-content-secondary">
          {state.fallbackReason || state.region.regionName}
        </p>
        {message ? (
          <p role="alert" className="text-body-14-medium text-content-error">
            {message}
          </p>
        ) : null}
        <Button
          type="button"
          size="small"
          className="min-h-11"
          disabled={isPending}
          aria-busy={isPending}
          leading={false}
          trailing={false}
          onClick={handleConfirm}
        >
          {isPending ? "저장 중" : "네, 이 동네로 설정"}
        </Button>
        <Button
          type="button"
          size="small"
          className="min-h-11"
          variant="tertiary"
          disabled={isPending}
          leading={false}
          trailing={false}
          onClick={handleStart}
        >
          아니요, {district}이 아니에요
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-4">
      {message ? (
        <p role="status" className="text-body-14-medium text-content-secondary">
          {message}
        </p>
      ) : null}
      <Button
        type="button"
        size="small"
        className="min-h-11"
        leading={false}
        trailing={false}
        onClick={handleStart}
      >
        현재 위치로 다시 설정
      </Button>
    </div>
  );
}
