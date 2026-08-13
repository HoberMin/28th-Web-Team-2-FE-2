import Image from "next/image";

interface IntroStepProps {
  error: string;
  isLoading: boolean;
  onKakaoLogin: () => void;
}

export function IntroStep({ error, isLoading, onKakaoLogin }: IntroStepProps) {
  return (
    <main className="min-h-dvh overflow-y-auto bg-surface-secondary">
      <div
        className="relative mx-auto w-full max-w-97.5 overflow-hidden bg-surface-primary"
        style={{
          height: "min(100dvh, 844px)",
          minHeight: "min(844px, 100dvh)",
          backgroundImage:
            "linear-gradient(180deg, #fff 20%, #f7fff3 36.467%, #e8fbd5 60.099%, #dbfbb9 100%)",
        }}
      >
        <Image
          src="/figma/design-library/images/onboarding-logo@2x.png"
          alt="장보고"
          width={112}
          height={52}
          priority
          className="absolute left-1/2 top-20.5 h-13 w-28 -translate-x-1/2 object-contain"
        />

        <div className="absolute left-1/2 top-38.5 flex w-62.5 -translate-x-1/2 flex-col items-center gap-2 text-center">
          <h1 className="w-full text-[26px] font-bold leading-[1.49] tracking-[-0.02em] text-content-primary">
            우리 동네 야채 시세
          </h1>
          <p className="w-full whitespace-nowrap text-body-16-medium text-content-secondary">
            오늘의 야채는 얼마인지 이웃이 알려줘요!
          </p>
        </div>

        <Image
          src="/figma/design-library/images/onboarding-hero@2x.png"
          alt=""
          width={390}
          height={499}
          priority
          className="absolute left-0 top-61.5 h-124.75 w-full object-contain"
        />

        <div className="absolute inset-x-0 bottom-0 h-18 px-5 pb-3 pt-2">
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
            <p className="mt-1 text-center text-body-12-medium text-content-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
