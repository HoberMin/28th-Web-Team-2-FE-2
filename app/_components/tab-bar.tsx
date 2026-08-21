import Link from "next/link";
import { cn } from "../_lib/cn";

// Figma `tab/bar` — Design Library 정식 등록 컴포넌트(componentKey a54ecef1…),
// 자식 `tab/item`은 component_set(componentKey 90543260…). sync 2026-08-08.
// 화면 안에서 목록을 두 갈래로 가르는 상단 탭. F04 찜(야채·가게)이 첫 사용처다.
//
// get_design_context 실측 (F04 인스턴스 298-3578 · 298-3596):
//   bar   flex items-center justify-between · w-[358px]
//         → w-full. 358은 390 뷰포트에서 좌우 거터 16을 뺀 값이라 고정 폭이 아니다.
//         높이 43은 자식에서 파생되는 값이라 고정하지 않는다.
//   item  flex items-center justify-center p-[8px] · border-b-2 border-solid · w-[179px]
//         → p-2 border-b-2, 179(=358÷2)는 flex-1로 옮긴다(소수점 나눗셈을 코드에 박지 않는다)
//   label body/16-semibold · text-center · whitespace-nowrap
//   status=selected → content/primary  + border/tertiary
//   status=default  → content/disabled + border/primary
//
// Variant 축은 `status`(selected · default) 하나다. 두 화면의 인스턴스에서 이 두 심볼만
// 관찰됐고, MCP 검색(search_design_system)은 세트의 variant 목록을 돌려주지 않아
// **"이 둘이 전부"임은 미확인**이다. hover·pressed 같은 상태가 세트에 더 있다면 추가 sync가 필요하다.
//
// ⚠️ 인디케이터는 별도 요소가 아니라 **아이템 자신의 border-bottom 2px**다. 슬라이딩 애니메이션이
//    아니고, 비선택 아이템도 border/primary로 밑줄을 계속 들고 있어 바 전체가 한 줄로 이어져 보인다.
//
// ⚠️ 밑줄은 full-bleed가 아니다 — Figma에서 바가 x=16 w=358이라 화면 좌우에 16px씩 남는다.
//    호출부가 px-4 안에 놓으면 원본과 같아진다. 원본 그대로 유지했다.
//
// ⚠️ 터치 타겟: 아이템 높이가 43px로 권장 44×44에 **1px 못 미친다**. Figma 원본 유지 원칙에 따라
//    임의로 키우지 않았다(figma-bridge §4) — 디자이너 확인 항목.
//
// ⚠️ 대비: default 라벨 content/disabled(#b4bbcb) on 흰 배경 = **1.92:1** (기준 4.5:1) → 미달.
//    selected 라벨 content/primary 13.51:1 · selected 밑줄 border/tertiary 7.44:1은 통과.
//    비선택 밑줄 border/primary는 1.12:1이지만 구분선이라 정보 전달이 걸려 있지 않다.
//    색을 임의로 올리지 않는 대신, **선택 여부가 색으로만 전달되지 않도록** 마크업을 보강했다:
//    선택 항목에 `aria-current="page"` + 화면에 보이지 않는 "(선택됨)" 텍스트를 함께 낸다(WCAG 1.4.1).
//
// 접근성 마크업 선택: `role="tablist"`가 아니라 **내비게이션 링크**다. 이 탭은 패널을 토글하는
// 위젯이 아니라 URL을 바꿔 서버에서 다른 목록을 받아오는 이동이라, 실제 동작과 맞는 역할을 쓴다.

export interface TabBarItem {
  href: string;
  label: string;
}

export interface TabBarProps {
  items: TabBarItem[];
  /** 현재 선택된 항목의 href. 일치하는 항목이 selected 스타일을 받는다. */
  activeHref?: string;
  /** 내비게이션 랜드마크 이름. 화면에 nav가 여럿일 때 구분용. */
  ariaLabel: string;
  className?: string;
}

export function TabBar({ items, activeHref, ariaLabel, className }: TabBarProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn("relative flex w-full items-center justify-between", className)}
    >
      {(() => {
        const selectedIndex = Math.max(
          0,
          items.findIndex(({ href }) => href === activeHref),
        );
        return (
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-0.5 origin-left bg-border-tertiary transition-transform duration-200 ease-out"
            style={{
              width: `${100 / Math.max(items.length, 1)}%`,
              transform: `translateX(${selectedIndex * 100}%)`,
            }}
          />
        );
      })()}
      {items.map(({ href, label }) => {
        const selected = href === activeHref;

        return (
          <Link
            key={href}
            href={href}
            aria-current={selected ? "page" : undefined}
            className={cn(
              // UI QA 2026-08-20 #29: selected 라벨이 디자인보다 얇았다 → body/16-**bold**.
              // default는 그대로 body/16-semibold다.
              "relative z-10 flex flex-1 items-center justify-center border-b-2 border-solid border-transparent p-2 text-center whitespace-nowrap transition-colors duration-200",
              selected
                ? "text-body-16-bold text-content-primary"
                : "text-body-16-semibold text-content-disabled",
            )}
          >
            {label}
            {selected ? <span className="sr-only"> (선택됨)</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
