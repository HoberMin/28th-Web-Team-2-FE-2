import Link from "next/link";
import type { ReactNode } from "react";

// 약한 강조 배경 + 링크 한 줄 — "이걸 눌러보세요" 수준의 부드러운 유도.
// 시세 화면·첫 제보 카드에 같은 마크업이 반복되기 시작해 컴포넌트로 뽑았다(세 번째 복붙 방지).
// 주 CTA는 seed ActionButton을 쓴다. 이건 CTA가 아니라 **제안**이라 위계가 한 단 낮다.
//
// 배경·글자를 중립으로 둔 이유: 브랜드 주황을 작은 텍스트 색으로 쓰면 대비가 2.7:1까지 떨어져
// AA(4.5:1)를 못 넘긴다. 주황은 아이콘·채운 배경에만 남기고, 텍스트는 중립색으로 읽히게 한다.
export function CalloutLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center justify-center rounded-xl bg-bg-neutral-weak px-4 py-3 text-center text-body-14-medium text-fg-neutral active:bg-bg-neutral-weak-pressed"
    >
      {children}
    </Link>
  );
}
