import { cn } from "../../_lib/cn";

// F01 홈이 쓰는 에셋 자리표시.
//
// Figma F01_홈(298:3477)·F01_홈_더보기(298:3509)가 참조하는 아이콘·이미지 에셋은 전부 비어 있다:
//   icon/map-pin-fill(24) · icon/search(24) · icon/store-fill(20) · icon/chevron-right(20)
//   icon/store-stroke(16) · 등락 방향 화살표(16) · 야채 그림(48·40) · 뉴스 썸네일(200×108)
// 에셋 바이트를 받는 경로(`download_assets`)가 레포 정책상 차단돼 있어(figma-bridge §0-0)
// **임의로 아이콘을 그리지 않는다.** `app/(tabs)/_tab-nav.tsx`·`/playground` nav-gnb 스토리와
// 같은 점선 자리표시로 두고, 디자이너가 SVG를 주면 이 슬롯만 교체한다.
//
// 순수 자리표시라 스크린리더에서 숨긴다(WCAG 1.1.1 — 장식). 의미가 필요한 자리(등락 방향 등)는
// 호출부가 텍스트로 따로 채운다.

export function AssetSlot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block shrink-0 rounded-sm border border-border-primary border-dashed",
        className,
      )}
    />
  );
}
