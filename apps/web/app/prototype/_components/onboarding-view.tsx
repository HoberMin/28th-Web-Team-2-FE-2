"use client";

// F00 온보딩 — 닉네임 → 지역 선택 → 환영(문구 중심 히어로 + CTA) → 홈.
// 입력을 모두 마친 뒤 홈(목록)으로 넘어가기 직전에 환영 화면을 둔다(사용자 요청).
// 완료 전엔 홈(F01)이 이리로 리다이렉트한다(onboarding-gate.tsx).

import { type PointerEvent, type SVGProps, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ActionButton } from "seed-design/ui/action-button";
import IconChevronLeftLine from "@karrotmarket/react-monochrome-icon/IconChevronLeftLine";
import { BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import { setOnboarding } from "../_lib/onboarding-store";
import { setDistrict } from "../_lib/location";
import { searchRegions, regionsByProximity } from "../_lib/regions";
import { DEFAULT_DISTRICT, VEGETABLES } from "../_lib/vegetables";

type Step = "nickname" | "region" | "welcome";

// 검색 아이콘 — 디자이너 제공 에셋(public/veg/iconamoon_search.svg) 그대로 인라인.
// seed SuffixIcon(Radix Slot)이 className을 자식에 병합하므로 props를 svg로 전달한다.
function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M21 21L16.657 16.657M16.657 16.657C17.3998 15.9141 17.9891 15.0322 18.3912 14.0615C18.7932 13.0909 19.0002 12.0506 19.0002 11C19.0002 9.9494 18.7932 8.90908 18.3912 7.93845C17.9891 6.96782 17.3998 6.08589 16.657 5.343C15.9141 4.60011 15.0321 4.01082 14.0615 3.60877C13.0909 3.20673 12.0506 2.99979 11 2.99979C9.94936 2.99979 8.90905 3.20673 7.93842 3.60877C6.96779 4.01082 6.08585 4.60011 5.34296 5.343C3.84263 6.84333 2.99976 8.87821 2.99976 11C2.99976 13.1218 3.84263 15.1567 5.34296 16.657C6.84329 18.1573 8.87818 19.0002 11 19.0002C13.1217 19.0002 15.1566 18.1573 16.657 16.657Z"
        stroke="#747B8F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

  // 검색어가 있으면 부분일치 필터, 없으면 "지금 있는 동네"(현재 위치 기준 거리순).
  // UT는 기준 지역이 삼성동으로 고정이라 GPS 대신 DEFAULT_DISTRICT를 앵커로 쓴다(로딩 깜빡임 방지).
  const searching = regionQuery.trim().length > 0;
  const regions = searching ? searchRegions(regionQuery) : regionsByProximity(DEFAULT_DISTRICT);

  function start() {
    setOnboarding({ nickname: nickname.trim(), district, completed: true });
    setDistrict(district);
    router.replace("/prototype");
  }

  if (step === "nickname") {
    return (
      <PhoneFrame>
        <div onPointerDown={handleBackgroundPointerDown} className="flex min-h-0 flex-1 flex-col">
          <Scroll className="px-4 pt-10">
            <h1 className="text-head1-24 text-fg-neutral">사용할 닉네임을 알려주세요</h1>
            <div className="mt-8">
              <TextField value={nickname} onValueChange={(v) => setNickname(v.value)}>
                {/* iOS Safari는 제스처 없는 autoFocus로 키보드가 안 뜰 수 있음(실기기 한계) — 프로토 수용 */}
                <TextFieldInput placeholder="닉네임" aria-label="닉네임" autoFocus />
              </TextField>
            </div>
          </Scroll>
          <BottomBar>
            {/* 정식 규칙은 "값이 채워지면 활성화"(disabled={!nickname.trim()})지만,
                UT에서는 입력 조건 없이 흐름을 태우기로 함(사용자 요청) → 항상 활성. */}
            <ActionButton
              type="button"
              variant="neutralSolid"
              size="large"
              className="w-full"
              onClick={() => setStep("region")}
            >
              확인
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
          {/* 헤더 — 뒤로가면 닉네임 단계로 (와이어프레임 상단 arrow-left) */}
          <header className="relative flex h-14 shrink-0 items-center px-2">
            <button
              type="button"
              aria-label="뒤로 가기"
              onClick={() => setStep("nickname")}
              className="flex size-12 items-center justify-center rounded-full text-fg-neutral active:bg-bg-neutral-weak [&_svg]:size-6"
            >
              <IconChevronLeftLine />
            </button>
          </header>
          <Scroll className="px-4 pt-2">
            <h1 className="text-head1-24 text-fg-neutral">평소 어디에서 야채를 구매하나요?</h1>
            <div className="mt-8">
              <TextField
                value={regionQuery}
                onValueChange={(v) => setRegionQuery(v.value)}
                suffixIcon={<SearchIcon />}
              >
                <TextFieldInput placeholder="동 단위로 검색" aria-label="동 단위로 검색" autoFocus />
              </TextField>
            </div>

            {!searching && (
              <p className="mt-6 text-body-14-regular text-fg-neutral-subtle">지금 있는 동네</p>
            )}

            <ul className="mt-2 flex flex-col">
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
                      className="flex h-12 w-full items-center text-left active:bg-bg-neutral-weak"
                    >
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
