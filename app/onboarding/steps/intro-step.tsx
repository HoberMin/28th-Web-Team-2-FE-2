import Image from "next/image";

interface IntroStepProps {
  error: string;
  isLoading: boolean;
  onKakaoLogin: () => void;
}

function KakaoSymbol() {
  return (
    <span aria-hidden="true" className="relative block h-4 w-5 rounded-[50%] bg-black">
      <span className="absolute -bottom-0.5 left-0.5 size-1.5 -rotate-20 bg-black" />
    </span>
  );
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-1.5 text-green-700" aria-label="장보고">
      <span aria-hidden="true" className="relative block h-6 w-7 rounded-md bg-green-700">
        <span className="absolute -top-1.5 left-1/2 h-3 w-4 -translate-x-1/2 rounded-full border-2 border-green-700" />
        <span className="absolute left-1.5 top-2 size-1 rounded-full bg-white" />
        <span className="absolute right-1.5 top-2 size-1 rounded-full bg-white" />
      </span>
      <span className="text-[22.8px] font-bold tracking-[-0.06em]">장보고</span>
    </div>
  );
}

function HeroArtwork() {
  return (
    <div aria-hidden="true" className="absolute left-1/2 top-57.25 h-117.75 w-85.75 -translate-x-1/2">
      <div className="absolute left-4 top-2 h-101.75 w-70.5 -rotate-[9.12deg] rounded-[2rem] border-[0.5rem] border-green-700 bg-white shadow-[0_18px_40px_rgba(4,120,77,0.14)]">
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-gray-200" />
        <div className="px-5 pt-6">
          <div className="text-body-14-bold text-content-primary">오늘의 야채 시세</div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-2.5">
              <Image src="/veg/onion.svg" alt="" width={36} height={36} unoptimized />
              <span className="flex-1 text-body-14-semibold text-content-primary">양파</span>
              <span className="text-body-14-bold text-green-600">2,490원</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-surface-secondary p-2.5">
              <Image src="/veg/cucumber.svg" alt="" width={36} height={36} unoptimized />
              <span className="flex-1 text-body-14-semibold text-content-primary">오이</span>
              <span className="text-body-14-bold text-content-primary">1,280원</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-surface-secondary p-2.5">
              <Image src="/veg/tomato.svg" alt="" width={36} height={36} unoptimized />
              <span className="flex-1 text-body-14-semibold text-content-primary">토마토</span>
              <span className="text-body-14-bold text-content-primary">3,620원</span>
            </div>
          </div>
        </div>
      </div>

      <Image
        src="/veg/carrot.svg"
        alt=""
        width={118}
        height={118}
        unoptimized
        className="absolute -left-2 bottom-0 rotate-30 drop-shadow-lg"
      />
      <Image
        src="/veg/onion.svg"
        alt=""
        width={126}
        height={126}
        unoptimized
        className="absolute bottom-2 left-28 -rotate-18 drop-shadow-lg"
      />
      <Image
        src="/veg/cucumber.svg"
        alt=""
        width={86}
        height={86}
        unoptimized
        className="absolute bottom-8 right-0 rotate-6 drop-shadow-lg"
      />
    </div>
  );
}

export function IntroStep({ error, isLoading, onKakaoLogin }: IntroStepProps) {
  return (
    <main className="min-h-dvh overflow-y-auto bg-surface-secondary">
      <div
        className="relative mx-auto min-h-168 w-full max-w-97.5 overflow-hidden bg-surface-primary"
        style={{
          height: "min(100dvh, 844px)",
          backgroundImage:
            "linear-gradient(180deg, #fff 20%, #f7fff3 36.467%, #e8fbd5 60.099%, #dbfbb9 100%)",
        }}
      >
        <div className="absolute left-1/2 top-11 -translate-x-1/2">
          <BrandLogo />
        </div>

        <h1 className="absolute left-1/2 top-27.25 -translate-x-1/2 whitespace-nowrap text-[26px] font-bold leading-[1.49] tracking-[-0.02em] text-content-primary">
          우리 동네 야채 시세
        </h1>
        <p className="absolute left-1/2 top-39 -translate-x-1/2 whitespace-nowrap text-body-16-medium text-content-secondary">
          오늘의 야채는 얼마인지 이웃이 알려줘요!
        </p>

        <HeroArtwork />

        <div className="absolute left-7.75 top-116 rounded-full border border-[#eee] bg-white px-4 py-1.75 text-body-14-bold text-[#4e4843] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          야채 <span className="text-content-brand-light">46종</span>의 시세 확인
        </div>
        <div className="absolute left-[calc(50%+40.5px)] top-100.75 rounded-full border border-[#eee] bg-white px-4 py-1.75 text-body-14-bold text-[#4e4843] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <span className="text-content-brand-light">저렴한 가게</span> 탐색
        </div>

        <Image
          src="/figma/design-library/images/grass-left.svg"
          alt=""
          width={80}
          height={34}
          unoptimized
          className="absolute -left-9 top-147"
        />
        <Image
          src="/figma/design-library/images/grass-right.svg"
          alt=""
          width={95}
          height={34}
          unoptimized
          className="absolute -right-5 top-160"
        />

        <div className="absolute inset-x-0 bottom-0 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
          <button
            type="button"
            className="flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-kakao-500 text-body-16-semibold text-black disabled:opacity-70"
            disabled={isLoading}
            aria-busy={isLoading}
            onClick={onKakaoLogin}
          >
            <KakaoSymbol />
            {isLoading ? "카카오 로그인 중" : "카카오로 시작하기"}
          </button>
          {error ? (
            <p className="mt-1 text-center text-body-12-medium text-red-500" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
