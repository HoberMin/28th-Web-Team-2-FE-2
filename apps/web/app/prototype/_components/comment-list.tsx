"use client";

import { useState } from "react";
import { useCurrentDistrict } from "../_lib/location";
import { useOnboarding } from "../_lib/onboarding-store";
import { addComment, useComments } from "../_lib/comments-store";
import { formatDateDot } from "../_lib/format";

// 동네 댓글 — 같은 동 사용자만(동네 인증). 지금은 동 필터만, 구매인증 게이트는 추후 결정.
export function CommentList({ vegetableId }: { vegetableId: string }) {
  const { district } = useCurrentDistrict();
  const { nickname } = useOnboarding();
  const comments = useComments(vegetableId, district);
  const [body, setBody] = useState("");

  function handleSubmit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    addComment({ vegetableId, district, nickname: nickname || `${district} 이웃`, body: trimmed });
    setBody("");
  }

  return (
    <section aria-label="동네 댓글" className="flex flex-col gap-4 px-4 pt-7">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#141a24]">동네 댓글</h2>
        <span className="text-caption-12-regular text-fg-neutral-subtle">{district} 이웃만 보여요</span>
      </div>

      {comments.length === 0 ? (
        <p className="rounded-xl bg-bg-neutral-weak px-4 py-8 text-center text-body-14-regular text-fg-neutral-subtle">
          아직 댓글이 없어요.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-2xl bg-bg-neutral-weak px-4 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-body-14-medium text-fg-neutral">{c.nickname}</span>
                <span className="text-caption-12-regular text-fg-neutral-subtle">
                  {formatDateDot(c.createdAt.slice(0, 10))}
                </span>
              </div>
              <p className="mt-1 text-body-14-regular text-fg-neutral">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            // 한글 IME 조합 중 Enter는 무시(조합 확정 키) — 미완성 텍스트 제출 방지
            if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSubmit();
          }}
          aria-label="댓글 입력"
          placeholder="이웃에게 한마디 남겨보세요"
          className="min-w-0 flex-1 rounded-xl bg-bg-neutral-weak px-4 py-3 text-body-14-regular text-fg-neutral outline-none placeholder:text-fg-neutral-subtle"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!body.trim()}
          className="shrink-0 rounded-xl bg-bg-neutral-inverted px-4 py-3 text-body-14-medium text-fg-neutral-inverted disabled:opacity-40"
        >
          등록
        </button>
      </div>
    </section>
  );
}
