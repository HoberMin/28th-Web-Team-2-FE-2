"use client";

// F00-1 닉네임 → F00-2 지역 선택 → 홈. 라우트는 하나(`/prototype/onboarding`)고 단계는 화면 안에서 전환된다.
//
// 앞단에 F00-0(서비스 소개·로그인)이 생겼다. 그래서 여기 두 가지가 달라졌다:
//  1. 구 F00-3(환영 화면)을 없앴다 — 지역을 고르는 즉시 홈으로 간다. 도는 야채 그래픽이
//     로딩바로 읽혔고, 소개는 이제 진입 시점(F00-0)에서 한다.
//  2. 시작 단계를 저장 상태에서 계산한다(재진입 규칙). 카카오 인증을 마친 사람에게 인증을
//     다시 시키지 않고, 비회원(둘러보기)은 닉네임을 건너뛰고 지역부터 받는다.

import { type PointerEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ActionButton } from "seed-design/ui/action-button";
import IconChevronLeftLine from "@karrotmarket/react-monochrome-icon/IconChevronLeftLine";
import { BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import { readOnboarding, setOnboarding } from "../_lib/onboarding-store";
import { setDistrict } from "../_lib/location";
import { RegionPicker } from "./region-picker";

type Step = "nickname" | "region";

// 닉네임 규칙 — 제보자 표시명이라 식별 가능한 최소 길이를 두고, 카드 한 줄을 넘지 않게 상한을 건다.
const NICKNAME_MIN = 2;
const NICKNAME_MAX = 10;

// 여백 탭 시 키보드 내리기 — input/button 밖을 눌렀을 때만 포커스 해제.
function handleBackgroundPointerDown(event: PointerEvent<HTMLElement>) {
  const target = event.target as HTMLElement;
  if (target.closest("input, button, textarea")) return;
  (document.activeElement as HTMLElement | null)?.blur();
}

export function OnboardingView() {
  const router = useRouter();
  // 시작 단계는 **마운트 후에** 저장값에서 정한다. useState 초기화 함수에서 localStorage를 읽으면
  // 서버 프리렌더(값 없음 → 닉네임)와 클라 하이드레이션(값 있음 → 지역)이 다른 트리를 그려
  // 하이드레이션 불일치가 난다. 그래서 판정 전에는 step=null로 두고 아무것도 그리지 않는다.
  const [step, setStep] = useState<Step | null>(null);
  const [nickname, setNickname] = useState("");
  // 비회원 여부는 뒤로가기 목적지를 가른다(둘러보기는 닉네임 단계를 거치지 않았다).
  const [isGuest, setIsGuest] = useState(false);

  // localStorage는 서버에서 못 읽으므로 마운트 후 한 번 읽어 단계를 정한다 — 이게 하이드레이션
  // 불일치를 피하는 방법이다(store-detail·location-picker-sheet도 같은 패턴).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const saved = readOnboarding();
    // F00-0을 안 거쳤으면(회원/비회원 미결정) 소개 화면으로 되돌린다.
    if (!saved.authProvider) {
      router.replace("/prototype/intro");
      return;
    }
    setIsGuest(saved.authProvider === "guest");
    setNickname(saved.nickname);
    // 비회원은 닉네임을 받지 않는다. 회원인데 닉네임까지 저장돼 있으면 지역부터 이어간다.
    setStep(saved.authProvider === "guest" || saved.nickname ? "region" : "nickname");
  }, [router]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 검증은 trim 기준 — 공백만 입력한 값은 빈 값과 같게 본다.
  const trimmedNickname = nickname.trim();
  const nicknameValid =
    trimmedNickname.length >= NICKNAME_MIN && trimmedNickname.length <= NICKNAME_MAX;
  // 입력을 시작하기 전엔 에러를 띄우지 않는다(첫 화면이 빨갛게 뜨는 걸 막는다).
  const nicknameInvalid = nickname.length > 0 && !nicknameValid;

  function submitNickname() {
    if (!nicknameValid) return;
    // 단계 통과 즉시 저장 — 여기서 이탈하면 다시 켰을 때 지역 단계부터 이어간다.
    setOnboarding({ nickname: trimmedNickname });
    setStep("region");
  }

  function pickRegion(district: string) {
    // 지역을 고르는 즉시 온보딩 완료로 저장하고 홈으로. 확인 버튼·환영 화면 없음.
    setOnboarding({ district, completed: true });
    setDistrict(district);
    router.replace("/prototype");
  }

  function backFromRegion() {
    // 둘러보기(비회원)는 닉네임 단계를 거치지 않았으므로 소개 화면으로 돌아간다.
    if (isGuest) router.replace("/prototype/intro");
    else setStep("nickname");
  }

  // 단계 판정 전(프리렌더·하이드레이션 시점) — 빈 프레임만. 곧바로 아래 두 단계 중 하나로 바뀐다.
  // 스켈레톤을 두지 않는 이유: 판정은 localStorage 읽기 한 번이라 사람이 볼 만한 시간이 아니다.
  if (step === null) return <PhoneFrame>{null}</PhoneFrame>;

  if (step === "nickname") {
    return (
      <PhoneFrame>
        <form
          onPointerDown={handleBackgroundPointerDown}
          onSubmit={(event) => {
            event.preventDefault();
            submitNickname();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <Scroll className="px-4 pt-10">
            <h1 className="text-head1-24 text-fg-neutral">사용할 닉네임을 알려주세요</h1>
            <div className="mt-8">
              <TextField
                value={nickname}
                onValueChange={(v) => setNickname(v.value)}
                maxGraphemeCount={NICKNAME_MAX}
                invalid={nicknameInvalid}
                errorMessage={`${NICKNAME_MIN}자 이상 입력해 주세요`}
              >
                {/* iOS Safari는 제스처 없는 autoFocus로 키보드가 안 뜰 수 있음(실기기 한계) — 프로토 수용 */}
                <TextFieldInput
                  placeholder="닉네임"
                  aria-label="닉네임"
                  autoFocus
                  enterKeyHint="next"
                />
              </TextField>
            </div>
          </Scroll>
          <BottomBar>
            <ActionButton
              type="submit"
              variant="neutralSolid"
              size="large"
              className="w-full"
              disabled={!nicknameValid}
            >
              확인
            </ActionButton>
          </BottomBar>
        </form>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div onPointerDown={handleBackgroundPointerDown} className="flex min-h-0 flex-1 flex-col">
        {/* 헤더 — 뒤로가면 닉네임 단계(비회원은 소개 화면)로 */}
        <header className="relative flex h-14 shrink-0 items-center px-2">
          <button
            type="button"
            aria-label="뒤로 가기"
            onClick={backFromRegion}
            className="flex size-12 items-center justify-center rounded-full text-fg-neutral active:bg-bg-neutral-weak [&_svg]:size-6"
          >
            <IconChevronLeftLine />
          </button>
        </header>
        <Scroll className="px-4 pt-2">
          <h1 className="text-head1-24 text-fg-neutral">평소 어디에서 야채를 구매하나요?</h1>
          <div className="mt-8">
            <RegionPicker onSelect={pickRegion} />
          </div>
        </Scroll>
      </div>
    </PhoneFrame>
  );
}
