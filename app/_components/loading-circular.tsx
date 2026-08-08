import { cn } from "../_lib/cn";

// Figma `loading/circular` — Design Library node 436-25632 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 축은 `animate`(false·true) 하나 — 심볼 2개(436-25631 · 436-25630).
//
// get_design_context 실측:
//   루트           h-[18px], 내부 트랙 w-[18px] → 18×18 정사각 (size-4.5)
//   내부 구조      "Ratio/Vertical"(overflow-clip) + rotate(-19.47deg) 헬퍼 + 전면 <img>
//                  → 실제로 보이는 링은 **단일 SVG 에셋 하나**이고, Ratio 계열은 Figma가
//                     아크를 표현하려고 끼워 넣은 보조 노드다(시각적 기여 없음).
//
// ⚠️ 링 글리프의 정확한 형상은 Figma에서 측정하지 못했다 — 아래 3개는 **추정값**이다:
//      · stroke 두께 (여기선 2)
//      · 아크가 도는 각도 (여기선 270°, 원주의 75%)
//      · 끊긴 자리의 위치 (여기선 12시에서 시작)
//    이유: 링이 `download_assets`로만 받을 수 있는 SVG 에셋이고 그 경로는 레포 정책상 차단돼 있다
//    (figma-bridge §0-0). 게다가 `get_screenshot`은 이 노드를 **네이티브 18×18 위로 확대해 주지 않아서**
//    (maxDimension은 축소만 한다) 렌더에서 두께를 재는 것도 불가능했다.
//    → 디자이너 확인 필요. 확정되면 아래 ARC 상수만 고치면 된다.
//
// ⚠️ `get_variable_defs`가 이 노드에서 빈 객체를 반환한다 = 링 색이 Variable에 바인딩돼 있지 않다.
//    그래서 hex를 하드코딩하지 않고 `currentColor`로 둔다. 실제로 button의 loading 심볼 4종
//    (primary·secondary·tertiary·outlined)을 렌더로 대조해 보면 스피너 색이 **그 variant의 글자색과
//    항상 같다** — primary/secondary는 밝은 색(content/inverse), tertiary/outlined는 어두운 색
//    (content/secondary). currentColor면 그 규칙이 저절로 성립하므로 임의 매핑을 만들 필요가 없다.
//
// 모션: `animate-spin`(Tailwind 기본 1s linear infinite). Figma의 animate=true는 애니메이션 에셋이라
//    회전 주기를 읽을 수 없었다 — 주기도 추정값이다.
//    `prefers-reduced-motion`으로 멈추지 않는 이유: 로딩 표시는 진행 상태를 알리는 필수 정보라
//    WCAG 2.2.2의 "essential" 예외에 해당한다(멈추면 로딩 중인지 알 수 없다).

/** 원주 = 2π×8. dasharray를 이 값 기준으로 나눠 아크 길이를 정한다. */
const CIRCUMFERENCE = 2 * Math.PI * 8;
/** 아크가 차지하는 비율 — **추정값**(위 주석 참고). */
const ARC_RATIO = 0.75;

export interface LoadingCircularProps {
  /** Figma의 animate 축. true면 회전한다. */
  animate?: boolean;
  /**
   * 스크린리더용 설명. 주면 `role="status"`로 읽히고, 생략하면 장식으로 취급해 숨긴다.
   * 버튼 안처럼 바깥에 이미 `aria-busy`가 있는 자리에서는 생략한다.
   */
  label?: string;
  className?: string;
}

export function LoadingCircular({ animate = false, label, className }: LoadingCircularProps) {
  return (
    <span
      className={cn("inline-flex size-4.5 shrink-0 items-center justify-center", className)}
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : "true"}
    >
      <svg
        viewBox="0 0 18 18"
        width="18"
        height="18"
        fill="none"
        className={cn(animate && "animate-spin")}
      >
        <circle
          cx="9"
          cy="9"
          r="8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE * ARC_RATIO} ${CIRCUMFERENCE * (1 - ARC_RATIO)}`}
          transform="rotate(-90 9 9)"
        />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
