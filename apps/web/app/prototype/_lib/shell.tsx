// 모바일 프레임 프레젠테이션 요소 (훅 없음 — 서버 컴포넌트 안전).
// 프레임 = iPhone 12 Pro 논리 해상도 390×844pt (UT 기준 기기).

import Link from "next/link";
import type { ReactNode } from "react";
import IconChevronLeftLine from "@karrotmarket/react-monochrome-icon/IconChevronLeftLine";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center bg-bg-neutral-weak md:items-center md:py-8">
      <div
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-bg-layer-default md:h-[844px] md:rounded-[2rem] md:shadow-xl"
        style={{ maxWidth: 390 }}
      >
        {children}
      </div>
    </div>
  );
}

interface AppBarProps {
  title?: ReactNode;
  /** 뒤로가기 목적지. 없으면 뒤로 버튼 숨김. */
  backHref?: string;
  /**
   * 고정 목적지가 아니라 **온 길로** 돌아가야 할 때 쓴다(클라 컴포넌트에서 router.back()을 넘긴다).
   * 여러 경로에서 진입하는 화면(가게 상세·즉석 판단)은 backHref를 박으면 엉뚱한 곳으로 나간다.
   * onBack이 있으면 backHref보다 우선한다.
   */
  onBack?: () => void;
  right?: ReactNode;
}

export function AppBar({ title, backHref, onBack, right }: AppBarProps) {
  const backClass =
    "absolute left-1 flex size-12 items-center justify-center rounded-full text-fg-neutral hover:bg-bg-neutral-weak [&_svg]:size-6";

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-center px-2">
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="뒤로 가기" className={backClass}>
          <IconChevronLeftLine />
        </button>
      ) : (
        backHref && (
          <Link href={backHref} aria-label="뒤로 가기" className={backClass}>
            <IconChevronLeftLine />
          </Link>
        )
      )}
      {title && <h1 className="text-head2-18 text-fg-neutral">{title}</h1>}
      {right && <div className="absolute right-1 flex items-center">{right}</div>}
    </header>
  );
}

/** 스크롤 본문 영역. */
export function Scroll({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={`min-h-0 flex-1 overflow-y-auto ${className ?? ""}`}>{children}</main>;
}

/** 하단 고정 CTA 영역. */
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 border-t border-bg-neutral-weak bg-bg-layer-default px-4 pt-3 pb-6">
      {children}
    </div>
  );
}
