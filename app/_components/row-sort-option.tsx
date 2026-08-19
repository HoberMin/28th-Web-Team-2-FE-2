import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `row/sort-option` — Design Library component set **318-14915** (`(Component) 작업실`
// 페이지가 기준 원본이다 — 0819 전수조사 17·18번에서 확정. `(공유) Component` 사본은 낡음).
// 재sync 2026-08-19: state 축이 **2개 → 4개**로 늘었다.
//
//   state=normal          318-14814 · h58 · py-16 + border-b border/secondary · body/16-medium
//   state=selected        318-14916 · h58 · py-16 + border-b + gap-4 · body/16-**bold** + check 20
//   state=current         831-35690 · h49 · py-12 + **테두리 없음** + gap-4 · body/16-medium + badge
//   state=current-selected 836-12227 · h49 · py-12 + **테두리 없음** + justify-between ·
//                          (body/16-**bold** + badge) 묶음 + check 20
//
// ⚠️ 2026-08-08 sync 시점의 코드는 selected에서도 body/16-medium을 썼는데 **원본은 bold였다**
//    (`state=selected` 318-14917 텍스트가 Wanted Sans Bold). product-spec의 "선택된 항목은
//    두꺼운 글씨 + 체크 이모지"와도 맞다 — 이번에 bold로 교정했다. 이 컴포넌트를 쓰는
//    `list/sort-option`·F04-2 야채 카테고리 행도 함께 굵어진다(원본과 맞춰지는 방향).
//
// ⚠️ **`current`는 "현재 위치"라는 뜻이 아니라 49 높이(py-12·테두리 없음) 축이다.** F00-2 온보딩
//    지역 목록이 이 축을 통째로 쓰고(5행 전부 current 계열), 그중 사용자의 현재 위치 행만
//    `badge/current-location`을 켠다 — 즉 배지는 variant가 아니라 인스턴스 오버라이드라서
//    코드에서도 별도 `badge` 슬롯으로 열어 둔다. 이름이 헷갈리지만 Figma 축 이름을 그대로 옮겼다.
//    (0819 전수조사 30번 "같은 컴포넌트 안에서 높이가 49/58로 갈린다 → 48/56으로 통일" 은
//     아직 열린 항목이다. 통일되면 이 축 이름·값이 다시 바뀔 수 있다.)
//
// check 색은 content/brand/light(#05a163) — 836-12227 변수 바인딩 실측.

export interface RowSortOptionProps extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  label: string;
  selected?: boolean;
  /**
   * Figma state 축의 `current` 계열(높이 49 · py-12 · 테두리 없음).
   * 기본 false = `normal`/`selected` 계열(높이 58 · py-16 · border-b).
   * "현재 위치"라는 뜻이 아니다 — 위 머리말 참고.
   */
  current?: boolean;
  /** 라벨 뒤에 붙는 배지 슬롯. F00-2가 `badge/current-location`을 여기에 넣는다. */
  badge?: ReactNode;
  /** selected일 때 표시할 Figma 20×20 check 아이콘. */
  checkIcon?: ReactNode;
}

export function RowSortOption({
  label,
  selected = false,
  current = false,
  badge,
  checkIcon,
  className,
  type = "button",
  ...rest
}: RowSortOptionProps) {
  // 라벨은 Figma에서 whitespace-nowrap(자동 너비)이지만, 실제 데이터는 길이가 제각각이라
  // 넘칠 때 잘리게 둔다. 잘림은 flex 자식이 min-w-0일 때만 동작한다.
  const labelNode = <span className="min-w-0 truncate">{label}</span>;

  return (
    <button
      type={type}
      aria-pressed={selected}
      // cn()은 tailwind-merge가 아니라 단순 join이라 같은 속성의 유틸이 둘 붙으면
      // @theme 선언 순서에 결과가 의존한다 → 아래 분기는 전부 상호배타로 둔다.
      className={cn(
        "flex w-full items-center gap-1 bg-surface-primary text-left text-content-primary",
        current ? "py-3" : "border-b border-border-secondary py-4",
        current && selected && "justify-between",
        selected ? "text-body-16-bold" : "text-body-16-medium",
        className,
      )}
      {...rest}
    >
      {badge ? (
        <span className="flex min-w-0 items-center gap-1">
          {labelNode}
          {badge}
        </span>
      ) : (
        labelNode
      )}
      {selected ? (
        <span
          aria-hidden="true"
          className="flex size-5 shrink-0 items-center justify-center text-content-brand-light"
        >
          {checkIcon}
        </span>
      ) : null}
    </button>
  );
}
