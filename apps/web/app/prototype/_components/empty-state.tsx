import type { ReactNode } from "react";

// 마이페이지 하위 화면 공용 빈 상태 — 목록형 화면(찜/제보/구매/단골 가게)이 같은 생김새를 쓴다.
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-bg-neutral-weak px-4 py-10 text-center text-body-14-regular text-fg-neutral-muted">
      {children}
    </p>
  );
}
