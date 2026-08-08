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
// icon/search·icon/close-fill 원본은 `public/figma/design-library/icons/`에 export했다.
// 입력값 소유권은 호출부에 있으므로 trailing 슬롯은 유지하고 상태에 맞는 에셋을 넘긴다.
//
// ⚠️ Figma의 텍스트 스타일 `body/16-medium`이 이 노드에서는 구 Pretendard 메트릭
//    (lineHeight 1.5 / letterSpacing -3%)으로 잡혀 있다. 현재 토큰(Wanted Sans, 1.55 / -2%)이
//    타이포 최종본(node 171-3737)이므로 토큰을 따랐다. Figma 쪽 스타일 갱신이 필요하다.
//
// ⚠️ focus 상태(Property 1 = focused, node 359-18433)가 2026-08-06에 새로 생겼다 — 실측 확인함.
//    get_design_context로 확인한 결과, 배경(surface/secondary)·크기·radius 전부 normal과 동일하고
//    시각적 차이는 없다. 화면엔 Figma가 캐럿(입력 커서)을 정적으로 표현하려고 넣은 장식용
//    "indicator" 막대(content/secondary, 1×19px)뿐인데, 이건 실제 `<input>`이 포커스 시
//    네이티브 캐럿을 공짜로 그려주므로 코드로 옮길 필요가 없다.
//    ⚠️ get_variable_defs는 이 노드 서브트리에 `border/tertiary`(#4a5667)가 바인딩돼 있다고
//    보고했지만, get_design_context가 반환한 실제 렌더 코드에는 border 클래스가 전혀 없다
//    (같은 도구가 outlined 버튼에서는 border를 정상적으로 잡아냈으므로 추출 누락이 아니라
//    실제 미적용으로 판단 — 아마 stroke weight 0). 두 값이 어긋나 교차검증에 실패했으므로
//    테두리 색을 임의로 추가하지 않았다. 필요하면 디자이너에게 확인 요청.
//    → 결론: 코드 변경 없음. 브라우저 기본 포커스 링을 지우지 않고 그대로 둔다
//    (지우면 WCAG 2.4.7 위반). 이제 "정의가 없어서"가 아니라 "정의를 확인했고 normal과
//    동일해서" 그대로 둔다는 뜻이다.

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
