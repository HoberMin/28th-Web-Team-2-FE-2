"use client";

import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { useOnboarding } from "../_lib/onboarding-store";
import { addComment, getCommentsReadError, useComments } from "../_lib/comments-store";
import { getStoreReviewsReadError, useStoreReviews, type StoreReviewRating } from "../_lib/store-reviews-store";
import { getReportAge } from "../_lib/stores";

const RATING_LABEL: Record<StoreReviewRating, string> = { good: "좋아요", fair: "보통", bad: "별로" };

interface FeedEntry {
  id: string;
  createdAt: string;
  authorLabel: string;
  body: string;
  ratingLabel?: string;
}

// 동네 댓글 — 가게 단위(F09 가게 상세). 이전엔 품목×동네였는데, 화제가 원래 가게 단위라
// 46종×동네로 흩으면 밀도가 안 남아 옮겼다(F03 백로그 #12).
//
// 가게 신선도 후기의 "한마디"(store-reviews-store.ts)도 여기 시간순으로 섞는다 — 후기용
// 별도 목록을 새로 만들면 비슷한 목록이 둘이 된다(백로그 F09 #1). 요약 숫자(좋아요/보통/별로)는
// store-detail.tsx가 요약 카드 근처에 따로 보여준다.
//
// hydrated=false인 동안은 로딩 스켈레톤 — localStorage 기반 스토어라 서버 스냅샷은 항상 빈
// 배열이라, 그대로 렌더하면 "댓글 없음"이 한 틱 깜빡인 뒤 실제 목록으로 바뀐다(백로그 F09 #12).
// canWrite=false면 입력 대신 안내로 대체 — "동네 댓글"은 현재 동네 가게에만 쓸 수 있다(#9).
export function CommentList({
  storeName,
  todayIso,
  hydrated,
  canWrite,
}: {
  storeName: string;
  todayIso: string;
  hydrated: boolean;
  canWrite: boolean;
}) {
  const { nickname } = useOnboarding();
  const comments = useComments(storeName);
  const reviews = useStoreReviews(storeName);
  const [body, setBody] = useState("");
  const [announcement, setAnnouncement] = useState("");

  function handleSubmit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    addComment({ storeName, nickname: nickname || "이웃", body: trimmed });
    setBody("");
    setAnnouncement("댓글을 등록했어요");
  }

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        {[0, 1].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-bg-neutral-weak" />
        ))}
      </div>
    );
  }

  const readError = getCommentsReadError() || getStoreReviewsReadError();

  // 날짜 표기 통일(백로그 「공통」) — 댓글도 제보와 같은 상대 표기("3일 전")를 쓴다.
  const entries: FeedEntry[] = [
    ...comments.map((c) => ({
      id: c.id,
      createdAt: c.createdAt,
      authorLabel: c.nickname,
      body: c.body,
    })),
    ...reviews
      .filter((r) => Boolean(r.comment))
      .map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        authorLabel: "이웃 후기",
        body: r.comment ?? "",
        ratingLabel: RATING_LABEL[r.rating],
      })),
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return (
    <div className="flex flex-col gap-4">
      {/* 등록 결과를 스크린리더에도 알린다(백로그 F09 #11 — 라이브 리전 부재) */}
      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>

      {readError ? (
        <p className="rounded-xl bg-bg-neutral-weak px-4 py-8 text-center text-body-14-regular text-fg-neutral-muted">
          댓글을 불러오지 못했어요. 새로고침해 주세요.
        </p>
      ) : entries.length === 0 ? (
        <p className="rounded-xl bg-bg-neutral-weak px-4 py-8 text-center text-body-14-regular text-fg-neutral-muted">
          아직 댓글이 없어요.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((e) => (
            <li key={e.id} className="rounded-2xl bg-bg-neutral-weak px-4 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="flex items-center gap-1.5 text-body-14-medium text-fg-neutral">
                  {e.authorLabel}
                  {e.ratingLabel && (
                    <span className="rounded bg-bg-layer-default px-1.5 py-0.5 text-caption-12-regular text-fg-neutral-muted">
                      {e.ratingLabel}
                    </span>
                  )}
                </span>
                <span className="text-caption-12-regular text-fg-neutral-muted">
                  {getReportAge(e.createdAt, todayIso).label}
                </span>
              </div>
              <p className="mt-1 text-body-14-regular text-fg-neutral">{e.body}</p>
            </li>
          ))}
        </ul>
      )}

      {/* 입력은 seed TextField로 — 제보 폼·위치 선택과 같은 입력 컴포넌트를 쓴다
          (이전엔 여기만 raw input이라 같은 앱에서 입력 필드 생김새가 두 종류였다) */}
      {canWrite ? (
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
          {/* size="large"(44px 이상) — 이전 "medium"은 40px로 터치 타겟에 못 미쳤다(백로그 F09 #10) */}
          <ActionButton
            type="button"
            variant="neutralSolid"
            size="large"
            onClick={handleSubmit}
            disabled={!body.trim()}
          >
            등록
          </ActionButton>
        </div>
      ) : (
        <p className="rounded-xl bg-bg-neutral-weak px-4 py-3 text-center text-caption-12-regular text-fg-neutral-muted">
          이 동네 제보가 없는 가게라 댓글은 읽기만 가능해요.
        </p>
      )}
    </div>
  );
}
