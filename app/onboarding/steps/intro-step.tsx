import Image from "next/image";

interface IntroStepProps {
  error: string;
  isLoading: boolean;
  onKakaoLogin: () => void;
}

export function IntroStep({ error, isLoading, onKakaoLogin }: IntroStepProps) {
  return (
    <main className="min-h-dvh overflow-y-auto bg-surface-secondary">
      {/*
        UI QA 2026-08-20 #1 "상단 여백이 커서 화면이 잘려서 보이는 오류".
        원인은 에셋이 아니라 **레이아웃**이었다 — Figma 844px 프레임 좌표를 그대로 absolute로
        옮겨 놓아서, 844보다 짧은 실기기(대부분이 그렇다)에서는 로고 아래 여백은 그대로인데
        일러스트 아래쪽(246 + 499 = 745px 지점 이후)이 `overflow-hidden`에 잘려 나갔다.
        절대좌표를 걷어내고 세로 흐름으로 바꾼다 — 위아래 고정 요소를 먼저 놓고, 일러스트가
        남은 높이를 차지하며 `object-contain`으로 항상 전체가 들어오게 한다.
        (화질은 별건 — 아이콘·이미지 원본 일괄 교체 때 처리)
      */}
      <div
        className="mx-auto flex h-dvh max-h-211 w-full max-w-97.5 flex-col overflow-hidden bg-surface-primary"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #fff 20%, #f7fff3 36.467%, #e8fbd5 60.099%, #dbfbb9 100%)",
        }}
      >
        {/* pt-9.5(38px): Figma의 로고 top 82에서 iOS 상태바 목업 44를 뺀 값. */}
        <div className="flex shrink-0 flex-col items-center px-4 pt-9.5">
          <Image
            src="/figma/design-library/images/onboarding-logo@2x.png"
            alt="장보고"
            width={112}
            height={52}
            priority
            className="h-13 w-28 object-contain"
          />

          <div className="mt-5 flex w-62.5 max-w-full flex-col items-center gap-2 text-center">
            <h1 className="w-full text-[26px] font-bold leading-[1.49] tracking-[-0.02em] text-content-primary">
              우리 동네 야채 시세
            </h1>
            <p className="w-full whitespace-nowrap text-body-16-medium text-content-secondary">
              오늘의 야채는 얼마인지 이웃이 알려줘요!
            </p>
          </div>
        </div>

        {/* 남은 높이를 전부 쓰고, 이미지는 아래에 붙인 채 비율을 유지한다(잘리지 않는다). */}
        <div className="relative min-h-0 flex-1">
          <Image
            src="/figma/design-library/images/onboarding-hero@2x.png"
            alt=""
            fill
            sizes="390px"
            priority
            className="object-contain object-bottom"
          />
        </div>

        <div className="shrink-0 px-5 pt-2 pb-3">
          <button
            type="button"
            className="flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-kakao-500 text-body-16-semibold text-black disabled:opacity-70"
            disabled={isLoading}
            aria-busy={isLoading}
            onClick={onKakaoLogin}
          >
            <Image
              src="/figma/design-library/images/kakao-symbol@2x.png"
              alt=""
              width={20}
              height={20}
              className="size-5"
            />
            {isLoading ? "카카오 로그인 중" : "카카오로 시작하기"}
          </button>
          {error ? (
            // `body-12-*` 토큰은 존재하지 않는다(@theme에 caption만 12가 있다) — 무효 클래스였다.
            <p className="mt-1 text-center text-caption-12-medium text-content-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
