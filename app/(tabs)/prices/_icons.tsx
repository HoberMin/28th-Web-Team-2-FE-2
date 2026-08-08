// F02 야채 시세 화면에서 쓰는 아이콘 **임시 도형**들.
//
// Figma에는 icon/search(285-2202) · icon/close-fill · icon/chevron-down(186-3393) ·
// icon/check(318-14921) · icon/heart-stroke-regular(338-8937) · icon/trend-*(477-9119~9121)이
// 정식 등록돼 있지만, 에셋 다운로드가 정책상 차단돼 있어(figma-bridge §0-0) 코드로 가져올 수 없다.
// 그래서 각 슬롯 크기에 맞춘 임시 글리프를 여기 로컬로 두고 슬롯에 꽂았다.
// **디자이너가 SVG를 전달하면 이 파일을 통째로 교체하면 된다** — 다른 파일은 손대지 않아도 된다.
//
// 전부 `currentColor`를 쓴다 — 색은 슬롯을 감싸는 컴포넌트가 토큰으로 씌운다.

export function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function CloseFillIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path
        d="m8.8 8.8 6.4 6.4M15.2 8.8l-6.4 6.4"
        stroke="var(--color-surface-primary)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4 6.5 4 4 4-4" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

export function HeartOutlineIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="23"
      height="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s-7.5-4.6-10-9.1C.6 8.6 2 5 5.5 5c2 0 3.4 1.1 4.5 2.6C11.1 6.1 12.5 5 14.5 5 18 5 19.4 8.6 22 11.9 19.5 16.4 12 21 12 21Z" />
    </svg>
  );
}

/** 등락 방향 3종 — 색만으로 방향을 전달하지 않도록 모양을 다르게 둔다(WCAG 1.4.1). */
export function TrendDownIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M8 12 3.5 6h9L8 12Z" />
    </svg>
  );
}

export function TrendUpIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M8 4l4.5 6h-9L8 4Z" />
    </svg>
  );
}

export function TrendFlatIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="2" rx="1" />
    </svg>
  );
}
