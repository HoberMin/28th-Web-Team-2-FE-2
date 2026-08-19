import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `nav/gnb` — Design Library node 223-7003, sync 2026-08-05.
// Variant 없음(단일 심볼). 하단 고정 글로벌 내비게이션.
//
// Figma 규격:
//   컨테이너 = surface/primary 배경 + border/primary 상단 1px, px 20 / pt 12 / pb 20,
//              항목은 flex-1로 균등 분배 (Figma 폭 390은 모바일 뷰포트라 코드에선 w-full)
//   항목     = 24×24 아이콘 + 라벨 세로 배치
//   활성     = 아이콘·라벨 content/primary + body/14-semibold
//   비활성   = 아이콘 content/disabled, 라벨 content/secondary + body/14-medium
//
// 아이콘은 호출부에서 Figma 원본 에셋을 주입한다. 활성/비활성 색상은 이 컴포넌트의
// currentColor를 통해 아이콘 슬롯까지 함께 전달된다.
//
// 대비: 비활성 라벨 content/secondary(gray-600)는 흰 배경에서 4.79:1로 AA(4.5:1)를 넘는다.
// 터치 영역: 항목 하나가 약 78×78px로 44×44 최소 기준을 넘는다.

export interface NavGnbItem {
  href: string;
  label: string;
  /** Figma의 24×24 아이콘 슬롯. 라벨이 옆에 있으므로 아이콘 자체는 장식으로 처리한다. */
  icon: ReactNode;
}

export interface NavGnbProps {
  items: NavGnbItem[];
  /** 현재 활성 항목의 href. 일치하는 항목이 활성 스타일 + `aria-current="page"`를 받는다. */
  activeHref?: string;
  /** 내비게이션 랜드마크 이름. 화면에 여러 nav가 있을 때 구분용. */
  ariaLabel?: string;
  className?: string;
}

export function NavGnb({ items, activeHref, ariaLabel = "주요 메뉴", className }: NavGnbProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "flex w-full items-center justify-between border-t border-border-primary bg-surface-primary px-5 pt-3 pb-5",
        className,
      )}
    >
      {items.map(({ href, label, icon }) => {
        const active = href === activeHref;

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center",
              active
                ? "text-body-14-semibold text-content-primary"
                : "text-body-14-medium text-content-secondary",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-6 items-center justify-center",
                active ? "text-content-primary" : "text-content-disabled",
              )}
            >
              {icon}
            </span>
            <span className="text-center whitespace-nowrap">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
