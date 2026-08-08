import { cn } from "../../_lib/cn";

// F03 화면이 쓰는 아이콘 자리표시.
//
// Figma가 이 화면에서 요구하는 아이콘은 5종이다 — icon/search(24) · icon/map-pin-fill(16) ·
// icon/heart-stroke-regular(23~24, 지도 우상단 필터) · icon/heart-stroke-regular(20, 시트) ·
// icon/close(20). 다섯 개 다 **에셋 바이트를 코드로 받을 수 없다**(figma-bridge §0-0).
//
// 그래서 임의로 글리프를 그려 넣지 않고 `_tab-nav.tsx`와 같은 점선 자리표시로 둔다.
// 디자이너가 SVG를 전달하면 이 파일만 실제 아이콘으로 교체하면 된다.
//
// 아이콘이 자리표시인 동안에도 의미가 사라지지 않도록, 이 슬롯을 쓰는 **모든 버튼은
// `aria-label`을 갖는다**(WCAG 4.1.2). 자리표시 자체는 `aria-hidden`으로 감춘다.

const SIZE = {
  16: "size-4",
  20: "size-5",
  24: "size-6",
} as const;

export type IconSlotSize = keyof typeof SIZE;

export function IconSlot({ size = 24, className }: { size?: IconSlotSize; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block rounded-sm border border-current border-dashed opacity-60",
        SIZE[size],
        className,
      )}
    />
  );
}
