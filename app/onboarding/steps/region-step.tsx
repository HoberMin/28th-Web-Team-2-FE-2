"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/app/_components/button";
import { LoadingCircular } from "@/app/_components/loading-circular";
import type { Region } from "@/app/_lib/api/schemas/regions";
import { districtNameOf, useCurrentRegionDetection } from "./use-current-region";

// F00-2 온보딩 · 지역.
//
// 2026-08-22 전환: **검색 필드와 근처 동네 목록을 없애고** "탐색 중 → 위치 확인" 2단으로 바꿨다.
// 사용자가 동네를 고르는 대신, 현재 위치로 찾은 동네 하나를 확인/부정만 한다.
//   · 「네, 맞아요」  → 그 동네로 온보딩 완료
//   · 「아니요, …」   → 로딩부터 다시 탐색 (사용자 결정 2026-08-22)
// 위치 권한 거부·타임아웃·조회 실패는 되묻지 않고 기본 동네(`FALLBACK_REGION`)로 진행하고
// 그 사실을 화면에서 알린다 — 검색 수단이 없어졌기 때문에 여기서 막으면 온보딩이 끝나지 않는다.
//
// ⚠️ 실측 규격이 없는 화면이다. Figma `F00_온보딩_지역`은 검색 + 후보 목록 시안이고 이 흐름의
//    시안은 아직 없다 — 제목 타이포·여백·버튼은 기존 지역 단계의 값을 그대로 이어 쓴다.

interface RegionStepProps {
  onComplete: (region: Region) => Promise<void>;
}

function StepShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-surface-secondary">
      <div className="mx-auto flex h-dvh w-full max-w-97.5 flex-col overflow-hidden bg-surface-primary">
        {children}
      </div>
    </main>
  );
}

// 문구는 화면 위쪽에 두고 가운데 정렬한다(2026-08-22 사용자 요청). 상단 여백 pt-10은
// 닉네임 단계와 같은 값이라 두 화면을 넘어갈 때 제목 위치가 흔들리지 않는다.
function DetectingView() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 pt-10 text-center">
      <p className="text-title-24-semibold text-content-primary" role="status">
        지금 계신 동네를
        <br />
        탐색 중이에요
      </p>
      <LoadingCircular animate className="mt-6 size-8 text-content-brand-medium" currentColor />
    </div>
  );
}

export function RegionStep({ onComplete }: RegionStepProps) {
  const { state, redetect } = useCurrentRegionDetection();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleConfirm() {
    if (!state.region || isSaving) return;

    setIsSaving(true);
    setSaveError("");
    try {
      await onComplete(state.region);
    } catch {
      setSaveError("동네를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setIsSaving(false);
    }
  }

  if (state.status !== "confirming" || !state.region) {
    return (
      <StepShell>
        <DetectingView />
      </StepShell>
    );
  }

  const district = districtNameOf(state.region);

  return (
    <StepShell>
      <div className="flex flex-1 flex-col px-4 pt-10 text-center">
        <h1 className="text-title-24-semibold text-content-primary">
          위치를 확인했어요.
          <br />
          {district}이 맞나요?
        </h1>
        <p className="mt-3 text-body-16-medium text-content-secondary">
          {state.fallbackReason || `${state.region.regionName} 기준으로 시세를 보여드릴게요.`}
        </p>
        {saveError ? (
          <p className="mt-3 text-body-14-medium text-content-error" role="alert">
            {saveError}
          </p>
        ) : null}
      </div>

      <footer className="shrink-0 bg-surface-primary px-5 pb-6 pt-2">
        <Button
          type="button"
          className="h-12.25 w-full"
          disabled={isSaving}
          aria-busy={isSaving}
          leading={false}
          trailing={false}
          onClick={handleConfirm}
        >
          {isSaving ? "저장 중" : "네, 맞아요"}
        </Button>
        <Button
          type="button"
          variant="tertiary"
          className="mt-2 h-12.25 w-full"
          disabled={isSaving}
          leading={false}
          trailing={false}
          onClick={redetect}
        >
          아니요, {district}이 아니에요
        </Button>
      </footer>
    </StepShell>
  );
}
