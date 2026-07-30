"use client";

import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { encodeErrandList } from "../_lib/errand";
import type { BasketItem } from "../_lib/basket-store";

// 장바구니 → 심부름 링크 공유.
// Web Share API가 있으면 그걸 쓰고(모바일 기본 공유 시트), 없으면 클립보드로 폴백한다.
// 둘 다 실패하면 링크를 화면에 그대로 보여준다 — 공유가 막혀 아무 일도 안 일어나는 상태를 만들지 않는다.
export function ShareErrandButton({ items }: { items: BasketItem[] }) {
  const [copied, setCopied] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState("");

  async function handleShare() {
    const url = `${window.location.origin}/prototype/errand?list=${encodeURIComponent(encodeErrandList(items))}`;
    const text = `장 볼 때 이 목록으로 부탁해요 (${items.length}개)`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "심부름 목록", text, url });
        return;
      } catch {
        // 사용자가 공유 시트를 닫은 경우 — 조용히 클립보드 폴백으로 넘어간다
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFallbackUrl(url);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <ActionButton
        type="button"
        variant="neutralWeak"
        size="large"
        className="w-full"
        onClick={handleShare}
      >
        {copied ? "링크를 복사했어요" : "가족에게 장보기 부탁하기"}
      </ActionButton>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "심부름 링크를 복사했어요" : ""}
      </span>
      {fallbackUrl && (
        <p className="rounded-xl bg-bg-neutral-weak px-3 py-2 text-caption-12-regular break-all text-fg-neutral-subtle">
          이 링크를 보내주세요: {fallbackUrl}
        </p>
      )}
    </div>
  );
}
