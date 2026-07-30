"use client";

import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
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
    <div className="flex flex-col gap-4">
      <p className="text-caption-12-regular text-fg-neutral-subtle">{district} 이웃만 보여요</p>

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

      {/* 입력은 seed TextField로 — 제보 폼·위치 선택과 같은 입력 컴포넌트를 쓴다
          (이전엔 여기만 raw input이라 같은 앱에서 입력 필드 생김새가 두 종류였다) */}
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <TextField
            value={body}
            onValueChange={(v) => setBody(v.value)}
            aria-label="댓글 입력"
          >
            <TextFieldInput
              placeholder="이웃에게 한마디 남겨보세요"
              onKeyDown={(e) => {
                // 한글 IME 조합 중 Enter는 무시(조합 확정 키) — 미완성 텍스트 제출 방지
                if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSubmit();
              }}
            />
          </TextField>
        </div>
        <ActionButton
          type="button"
          variant="neutralSolid"
          size="medium"
          onClick={handleSubmit}
          disabled={!body.trim()}
        >
          등록
        </ActionButton>
      </div>
    </div>
  );
}
