// 모바일 프레임 프레젠테이션 요소 (훅 없음 — 서버 컴포넌트 안전).
// 프레임 = iPhone 12 Pro 논리 해상도 390×844pt (UT 기준 기기).

import Link from "next/link";
import type { ReactNode } from "react";
import IconChevronLeftLine from "@karrotmarket/react-monochrome-icon/IconChevronLeftLine";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center bg-bg-neutral-weak md:items-center md:py-8">
      <div
        className="relative flex w-full flex-col overflow-hidden bg-bg-layer-default md:rounded-[2rem] md:shadow-xl"
        style={{ maxWidth: 390, height: 844 }}
      >
        {children}
      </div>
    </div>
  );
}

/** 저충실도 상태바 목업 (장식 — 스크린리더 제외). */
export function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`flex h-11 shrink-0 items-center justify-between px-6 pt-1 text-body-14-medium ${
        dark ? "text-fg-neutral-inverted" : "text-fg-neutral"
      }`}
      aria-hidden="true"
    >
      <span>9:41</span>
      <span className="tracking-widest">▪▪▪ ▮</span>
    </div>
  );
}

interface AppBarProps {
  title?: ReactNode;
  /** 뒤로가기 목적지. 없으면 뒤로 버튼 숨김. */
  backHref?: string;
  right?: ReactNode;
}

export function AppBar({ title, backHref, right }: AppBarProps) {
  return (
    <header className="relative flex h-14 shrink-0 items-center justify-center px-2">
      {backHref && (
        <Link
          href={backHref}
          aria-label="뒤로 가기"
          className="absolute left-1 flex size-12 items-center justify-center rounded-full text-fg-neutral hover:bg-bg-neutral-weak [&_svg]:size-6"
        >
          <IconChevronLeftLine />
        </Link>
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
