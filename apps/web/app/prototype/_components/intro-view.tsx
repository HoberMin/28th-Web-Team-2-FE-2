"use client";

// F00-0 서비스 소개 · 로그인 — 앱을 처음 켠 사람이 만나는 화면.
// 여기서 「카카오로 시작하기」와 「먼저 둘러볼게요」로 갈린다.
//
// 이전엔 이 화면이 없어서 첫 진입이 곧 닉네임 입력(F00-1)이었고, 입력을 다 마친 뒤에 환영 화면
// (구 F00-3)이 야채를 궤도로 돌렸다. 회원가입 맥락 없이 이름부터 묻고, 끝에서 도는 그래픽은
// 로딩으로 읽혔다 — 그래서 환영 화면을 걷어내고 그 자리를 이 소개·로그인 화면으로 바꿨다.
//
// 로그인은 목업이다(`kakao-auth.ts`). 비회원도 시세 조회까지 볼 수 있고, 제보·찜·단골·댓글에서
// 로그인을 요구하는 바텀시트는 아직 없다(다음 작업).

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import { setOnboarding } from "../_lib/onboarding-store";
import { startKakaoLogin } from "../_lib/kakao-auth";
import { getVegetable } from "../_lib/vegetables";
import type { Vegetable } from "../_lib/types";

/** 히어로에 띄우는 야채 3종 — 일러스트가 있는 품목만 쓴다(이모지는 이 크기에서 조악하다). */
const HERO = ["tomato", "carrot", "onion"]
  .map((id) => getVegetable(id))
  .filter((veg): veg is Vegetable & { image: string } => typeof veg?.image === "string");

/** 핵심 가치 3줄 — 아이콘도 야채 일러스트를 재사용한다(새 에셋 없이). */
const VALUES = [
  { vegetableId: "potato", title: "오늘 시세", body: "야채 46종, 매일 새로 확인해요" },
  { vegetableId: "garlic", title: "이웃이 본 동네 가격", body: "우리 동네 가게에서 실제로 본 가격이에요" },
  { vegetableId: "cucumber", title: "아낀 금액", body: "얼마나 덜 냈는지 쌓아서 보여줘요" },
];

export function IntroView() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  // 약관 원문은 프로토타입에 없다 — 죽은 링크를 만들지 않고 한 줄 안내로 대신한다.
  const [policyNotice, setPolicyNotice] = useState(false);

  async function loginWithKakao() {
    setPending(true);
    setError("");
    try {
      const { isNew } = await startKakaoLogin();
      // 인증 통과 즉시 저장 — 여기서 이탈해도 다시 켜면 닉네임 단계부터 이어간다(인증 재요구 없음).
      setOnboarding({ authProvider: "kakao" });
      router.replace(isNew ? "/prototype/onboarding" : "/prototype");
    } catch {
      // 취소는 에러가 아니지만, 목업에는 취소 경로가 없어 실패 한 가지만 다룬다.
      setError("로그인하지 못했어요. 잠시 후 다시 시도해 주세요");
      setPending(false);
    }
  }

  function browseAsGuest() {
    // 비회원은 닉네임을 건너뛰고 동네(F00-2)부터. 나중에 로그인하면 그때 닉네임을 받는다.
    setOnboarding({ authProvider: "guest" });
    router.replace("/prototype/onboarding");
  }

  return (
    <PhoneFrame>
      <Scroll className="px-6 pt-14">
        {/* 히어로 — 야채 3종이 느리게 둥실거린다(reduced-motion이면 정지). */}
        <div className="flex items-end justify-center gap-1" aria-hidden="true">
          {HERO.map((veg, i) => (
            <div
              key={veg.id}
              data-veg-motion
              style={{ animation: `veg-bob ${3.2 + i * 0.4}s ease-in-out ${i * 0.3}s infinite` }}
            >
              <Image
                src={veg.image}
                alt=""
                width={i === 1 ? 96 : 72}
                height={i === 1 ? 96 : 72}
                className="object-contain drop-shadow-md"
                style={{ width: i === 1 ? 96 : 72, height: i === 1 ? 96 : 72 }}
                priority
              />
            </div>
          ))}
        </div>

        <h1 className="mt-8 text-center text-head1-24 font-bold leading-tight text-fg-neutral">
          우리 동네 야채,
          <br />
          오늘 얼마인지 이웃이 알려줘요
        </h1>

        <ul className="mt-10 flex flex-col gap-5">
          {VALUES.map((value) => {
            const veg = getVegetable(value.vegetableId);
            return (
              <li key={value.title} className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-bg-brand-weak">
                  {veg?.image ? (
                    <Image
                      src={veg.image}
                      alt=""
                      width={26}
                      height={26}
                      className="object-contain"
                      style={{ width: 26, height: 26 }}
                    />
                  ) : (
                    <span aria-hidden="true">{veg?.emoji}</span>
                  )}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-body-16-semibold text-fg-neutral">{value.title}</span>
                  <span className="text-caption-12-regular text-fg-neutral-muted">{value.body}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Scroll>

      <BottomBar>
        {/* 카카오 버튼은 카카오 디자인 가이드 규격 그대로 쓴다 — 색(#FEE500)·검정 로고·문구를
            바꾸면 심사에서 반려된다. 이 raw hex는 브랜드 규정이라 토큰으로 대체하지 않는다. */}
        <button
          type="button"
          onClick={loginWithKakao}
          disabled={pending}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-lg text-body-16-semibold disabled:opacity-60"
          style={{ backgroundColor: "#FEE500", color: "rgba(0,0,0,0.85)" }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.463 2 10.734c0 2.741 1.82 5.15 4.556 6.518-.2.737-.726 2.68-.83 3.096-.13.517.19.51.4.372.164-.109 2.61-1.774 3.67-2.494.72.106 1.463.161 2.204.161 5.523 0 10-3.463 10-7.653C22 6.463 17.523 3 12 3z" />
          </svg>
          {pending ? "카카오 로그인 중…" : "카카오로 시작하기"}
        </button>

        {/* 실패는 버튼 아래 한 줄 + 재시도(버튼을 다시 누르면 된다). 취소는 에러로 보지 않는다. */}
        {error && (
          <p role="alert" className="mt-2 text-center text-caption-12-regular text-fg-critical">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={browseAsGuest}
          disabled={pending}
          className="mt-1 h-12 w-full text-body-14-regular text-fg-neutral-muted underline disabled:opacity-60"
        >
          먼저 둘러볼게요
        </button>

        <p className="mt-1 text-center text-caption-12-regular text-fg-neutral-muted">
          시작하면{" "}
          <button type="button" onClick={() => setPolicyNotice(true)} className="underline">
            이용약관
          </button>
          과{" "}
          <button type="button" onClick={() => setPolicyNotice(true)} className="underline">
            개인정보처리방침
          </button>
          에 동의한 것으로 봐요
        </p>
        {policyNotice && (
          <p className="mt-1 text-center text-caption-12-regular text-fg-neutral-muted">
            약관 문서는 아직 준비 중이에요
          </p>
        )}
      </BottomBar>
    </PhoneFrame>
  );
}
