"use client";

// F00 온보딩 — 닉네임 → 지역 선택 → 환영(문구 중심 히어로 + CTA) → 홈.
// 입력을 모두 마친 뒤 홈(목록)으로 넘어가기 직전에 환영 화면을 둔다(사용자 요청).
// 완료 전엔 홈(F01)이 이리로 리다이렉트한다(onboarding-gate.tsx).

import { type PointerEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ActionButton } from "seed-design/ui/action-button";
import IconMagnifyingglassLine from "@karrotmarket/react-monochrome-icon/IconMagnifyingglassLine";
import { BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import { setOnboarding } from "../_lib/onboarding-store";
import { setDistrict } from "../_lib/location";
import { searchRegions } from "../_lib/regions";
import { VEGETABLES } from "../_lib/vegetables";

type Step = "nickname" | "region" | "welcome";

// 환영 화면 3D 오빗 — 6종을 원 궤도에 등간격으로 배치해 Y축으로 돌린다.
// perspective로 앞쪽 야채는 커지고 뒤쪽은 작아지며, 각자는 빌보드로 항상 정면을 본다.
const ORBIT_COUNT = 6;
const ORBIT_RADIUS = 100; // px — 씬(size-64=256px) 안에서 도는 반지름
const ORBIT_DUR = 16; // s — 한 바퀴
const ORBIT = VEGETABLES.slice(0, ORBIT_COUNT).map((veg, i) => ({
  veg,
  angle: (360 / ORBIT_COUNT) * i,
  size: 54,
}));

// 배경 반짝임 좌표(%)와 딜레이.
const SPARKLES = [
  { left: 16, top: 26, delay: 0 },
  { left: 84, top: 22, delay: 0.6 },
  { left: 88, top: 66, delay: 1.1 },
  { left: 12, top: 62, delay: 1.6 },
];

// 여백 탭 시 키보드 내리기 — input/button 밖을 눌렀을 때만 포커스 해제.
function handleBackgroundPointerDown(event: PointerEvent<HTMLDivElement>) {
  const target = event.target as HTMLElement;
  if (target.closest("input, button, textarea")) return;
  (document.activeElement as HTMLElement | null)?.blur();
}

export function OnboardingView() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("nickname");
  const [nickname, setNickname] = useState("");
  const [regionQuery, setRegionQuery] = useState("");
  const [district, setPickedDistrict] = useState("");

  const regions = searchRegions(regionQuery);

  function start() {
    setOnboarding({ nickname: nickname.trim(), district, completed: true });
    setDistrict(district);
    router.replace("/prototype");
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
              다음
            </ActionButton>
          </BottomBar>
        </div>
      </PhoneFrame>
    );
  }

  if (step === "region") {
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
                      onClick={() => {
                        setPickedDistrict(region.label);
                        setStep("welcome");
                      }}
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

  // welcome — 입력 완료 후 홈 진입 직전의 문구 중심 히어로(+ CTA).
  const displayName = nickname.trim();
  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8 text-center">
        {/* 아기자기한 야채 정원 — 각자 둥실둥실 떠다니며 등장 (reduced-motion이면 정지) */}
        <div className="relative size-64" aria-hidden="true" style={{ perspective: 600 }}>
          {/* 부드러운 원형 배경 */}
          <div className="absolute inset-6 rounded-full bg-bg-brand-weak" />
          <div className="absolute inset-12 rounded-full bg-bg-brand-solid/10" />

          {/* 반짝임 */}
          {SPARKLES.map((s, i) => (
            <span
              key={`sparkle-${i}`}
              data-veg-motion
              className="absolute size-2 rounded-full bg-bg-brand-solid"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                animation: `veg-twinkle 2.4s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}

          {/* 3D 오빗 링 — Y축으로 회전(앞쪽 야채는 커지고 뒤쪽은 작아짐) */}
          <div
            data-veg-motion
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d", animation: `veg-orbit-spin ${ORBIT_DUR}s linear infinite` }}
          >
            {ORBIT.map((s) => (
              <div
                key={s.veg.id}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(-50%, -50%) rotateY(${s.angle}deg) translateZ(${ORBIT_RADIUS}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* 정적 빌보드 오프셋(-angle) + 링 회전 상쇄(counter) → 항상 정면 */}
                <div style={{ transform: `rotateY(${-s.angle}deg)`, transformStyle: "preserve-3d" }}>
                  <div data-veg-motion style={{ animation: `veg-orbit-counter ${ORBIT_DUR}s linear infinite` }}>
                    <Image
                      src={s.veg.image}
                      alt=""
                      width={s.size}
                      height={s.size}
                      className="object-contain drop-shadow-md"
                      style={{ width: s.size, height: s.size }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          data-veg-motion
          className="flex flex-col gap-3"
          style={{ animation: "veg-rise 0.5s ease-out 0.5s both" }}
        >
          <h1 className="text-head1-24 font-bold leading-tight text-fg-neutral">
            {displayName && (
              <>
                {displayName}님,
                <br />
              </>
            )}
            이제 우리 동네
            <br />
            야채 시세를 확인해 보세요!
          </h1>
          <p className="text-body-14-regular text-fg-neutral-subtle">
            {district}의 오늘 시세와 이웃 제보가를 모았어요
          </p>
        </div>
      </div>
      <BottomBar>
        <ActionButton
          type="button"
          variant="neutralSolid"
          size="large"
          className="w-full"
          onClick={start}
        >
          야채 시세 보러 가기
        </ActionButton>
      </BottomBar>
    </PhoneFrame>
  );
}
