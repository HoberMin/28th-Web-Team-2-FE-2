import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `field/text` — Design Library node 237-8556, sync 2026-08-05.
// Property 1 = normal | typing.
//
// Figma의 두 변형은 사실 "값이 비었나 / 찼나"의 차이라 코드에서는 별도 prop이 아니라
// input 값으로 자연스럽게 갈린다:
//   normal  → placeholder(content/disabled) + trailing에 icon/search
//   typing  → 입력값(content/primary)       + trailing에 icon/close-fill
// 그래서 trailing은 슬롯으로 열어 두고 호출자가 상황에 맞는 아이콘을 넣는다.
//
// ⚠️ 아이콘(icon/search·icon/close-fill)은 아직 코드에 없다 — Figma 아이콘 SVG를 받으려면
//    figma.com 에셋 URL을 내려받아야 하는데 레포 정책상 차단돼 있다(figma-bridge §0-0).
//    디자이너가 SVG를 따로 전달하면 그때 아이콘 컴포넌트를 추가한다.
//
// ⚠️ Figma의 텍스트 스타일 `body/16-medium`이 이 노드에서는 구 Pretendard 메트릭
//    (lineHeight 1.5 / letterSpacing -3%)으로 잡혀 있다. 현재 토큰(Wanted Sans, 1.55 / -2%)이
//    타이포 최종본(node 171-3737)이므로 토큰을 따랐다. Figma 쪽 스타일 갱신이 필요하다.
//
// ⚠️ focus 상태가 Figma에 없다. 브라우저 기본 포커스 링을 지우지 않고 그대로 둔다
//    (지우면 WCAG 2.4.7 위반). 포커스 디자인이 정해지면 그때 반영한다.

export interface TextFieldProps extends ComponentPropsWithoutRef<"input"> {
  /** Figma의 우측 아이콘 슬롯(24×24) — normal은 icon/search, typing은 icon/close-fill. */
  trailing?: ReactNode;
  /** 래퍼(높이·배경·radius)에 붙는 클래스. 너비 지정은 여기로. */
  className?: string;
}

export function TextField({ trailing, className, ...rest }: TextFieldProps) {
  return (
    <div
      className={cn(
        "flex h-13 w-full items-center justify-between gap-2 rounded-lg bg-surface-secondary px-4 py-2",
        className,
      )}
    >
      <input
        className="min-w-0 flex-1 bg-transparent text-body-16-medium text-content-primary placeholder:text-content-disabled"
        {...rest}
      />
      {trailing ? (
        <span className="flex size-6 shrink-0 items-center justify-center">{trailing}</span>
      ) : null}
    </div>
  );
}
