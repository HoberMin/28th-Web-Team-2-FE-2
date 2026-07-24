"use client";

// F00 온보딩 — 스플래시 → 닉네임 → 지역 선택. 완료 전엔 홈(F01)이 이리로 리다이렉트한다(onboarding-gate.tsx).
// 문구는 Figma("NEW Design") 그대로, 레이아웃/타이포는 seed 토큰으로 구성.

import { type PointerEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ActionButton } from "seed-design/ui/action-button";
import IconMagnifyingglassLine from "@karrotmarket/react-monochrome-icon/IconMagnifyingglassLine";
import { BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import { setOnboarding } from "../_lib/onboarding-store";
import { setDistrict } from "../_lib/location";
import { searchRegions } from "../_lib/regions";

type Step = "splash" | "nickname" | "region";

// 여백 탭 시 키보드 내리기 — input/button 밖을 눌렀을 때만 포커스 해제.
function handleBackgroundPointerDown(event: PointerEvent<HTMLDivElement>) {
  const target = event.target as HTMLElement;
  if (target.closest("input, button, textarea")) return;
  (document.activeElement as HTMLElement | null)?.blur();
}

export function OnboardingView() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("splash");
  const [nickname, setNickname] = useState("");
  const [regionQuery, setRegionQuery] = useState("");

  const regions = searchRegions(regionQuery);

  function complete(district: string) {
    setOnboarding({ nickname: nickname.trim(), district, completed: true });
    setDistrict(district);
    router.replace("/prototype");
  }

  if (step === "splash") {
    return (
      <PhoneFrame>
        <button
          type="button"
          onClick={() => setStep("nickname")}
          className="flex h-full w-full flex-col items-center justify-center gap-4 bg-bg-brand-solid px-8 text-center"
        >
          <span className="text-6xl leading-none" aria-hidden="true">
            🥬
          </span>
          <p className="text-head1-24 text-fg-brand-contrast">
            야채 시세를 알아보고,
            <br />
            알뜰한 장보기를 실천해 보아요
          </p>
        </button>
      </PhoneFrame>
    );
  }

  if (step === "nickname") {
    const trimmed = nickname.trim();
    return (
      <PhoneFrame>
        <div onPointerDown={handleBackgroundPointerDown} className="flex min-h-0 flex-1 flex-col">
          <Scroll className="px-4 pt-10">
            <h1 className="text-head1-24 text-fg-neutral">사용자 닉네임을 알려주세요</h1>
            <div className="mt-8">
              <TextField value={nickname} onValueChange={(v) => setNickname(v.value)}>
                {/* iOS Safari는 제스처 없는 autoFocus로 키보드가 안 뜰 수 있음(실기기 한계) — 프로토 수용 */}
                <TextFieldInput placeholder="닉네임" aria-label="닉네임" autoFocus />
              </TextField>
            </div>
          </Scroll>
          <BottomBar>
            <ActionButton
              type="button"
              variant="neutralSolid"
              size="large"
              className="w-full"
              disabled={!trimmed}
              onClick={() => setStep("region")}
            >
              확인
            </ActionButton>
          </BottomBar>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div onPointerDown={handleBackgroundPointerDown} className="flex min-h-0 flex-1 flex-col">
        <Scroll className="px-4 pt-10">
          <h1 className="text-head1-24 text-fg-neutral">평소 어디에서 야채를 구매하나요?</h1>
          <div className="mt-8">
            <TextField value={regionQuery} onValueChange={(v) => setRegionQuery(v.value)}>
              <TextFieldInput placeholder="지역명 검색" aria-label="지역명 검색" autoFocus />
            </TextField>
          </div>

          <ul className="mt-4 flex flex-col">
            {regions.length === 0 ? (
              <li className="py-12 text-center text-body-14-regular text-fg-neutral-subtle">
                검색 결과가 없어요
              </li>
            ) : (
              regions.map((region) => (
                <li key={region.id}>
                  <button
                    type="button"
                    onClick={() => complete(region.label)}
                    className="flex w-full items-center gap-2 py-3.5 text-left active:bg-bg-neutral-weak"
                  >
                    <span className="text-fg-neutral-subtle [&_svg]:size-5" aria-hidden="true">
                      <IconMagnifyingglassLine />
                    </span>
                    <span className="text-body-16-regular text-fg-neutral">{region.label}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </Scroll>
      </div>
    </PhoneFrame>
  );
}
