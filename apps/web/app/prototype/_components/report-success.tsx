"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionButton } from "seed-design/ui/action-button";
import { ChipLabel, RadioChipItem, RadioChipRoot } from "seed-design/ui/chip";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import { addStoreReview, type StoreReviewRating } from "../_lib/store-reviews-store";

const RATING_OPTIONS: { key: StoreReviewRating; label: string }[] = [
  { key: "good", label: "좋아요" },
  { key: "fair", label: "보통" },
  { key: "bad", label: "별로" },
];

// F04 제보 성공 — 제보 폼 확인 직후 도달.
//
// 가게명을 알고 있으면 **같은 가게의 다음 품목**을 이어서 입력하는 경로를 준다.
// 왜 필요한가: 매장 축 화면(매장 탭·가게 상세)이 성립하려면 "한 가게 × 여러 품목" 제보가 있어야 한다.
// 품목 하나마다 제보 흐름을 처음부터 다시 타게 하면 가게마다 1~2건씩만 흩뿌려져
// "이 가게가 전반적으로 싼가"에 답할 수 없다. 가게명은 유지하고 품목만 갈아끼운다.
//
// 가게 신선도(좋아요/보통/별로 + 한마디)는 **선택 입력**이다 — 이미 제보를 끝낸 뒤라 이탈 비용이
// 낮은 이 화면에서만 받는다. 표시는 가게 상세(F09)의 몫이라 여기서는 저장만 하고 보여주지 않는다.
export function ReportSuccess({ item, place }: { item: string; place: string }) {
  const router = useRouter();
  const nextHref = item ? `/prototype/price/${item}` : "/prototype";
  const continueHref = `/prototype/report?place=${encodeURIComponent(place)}`;

  const [rating, setRating] = useState<StoreReviewRating | null>(null);
  const [comment, setComment] = useState("");

  // 두 CTA 중 어느 쪽으로 나가도 평가를 잃지 않게 이 화면을 떠나기 직전에 저장한다.
  // 연속 입력("이 가게 가격 더 입력하기")이 이 화면의 주 동선이라, 그쪽에서만 빠지면
  // 평가를 고르고 이어서 입력한 사람의 값이 조용히 버려진다.
  function saveReview() {
    if (place && rating) {
      addStoreReview({ place, rating, comment: comment.trim() || undefined });
    }
  }

  function handleGoToPrice() {
    saveReview();
    router.push(nextHref);
  }

  return (
    <PhoneFrame>
      <Scroll className="flex flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <Image src="/veg/cart.svg" alt="" width={99} height={97} className="h-auto w-24" />
        <p className="text-head1-24 text-fg-neutral">제보 성공!</p>
        {place && (
          <p className="text-body-14-regular text-fg-neutral-muted">
            <strong className="font-semibold text-fg-neutral">{place}</strong>에서 본 다른 가격도
            <br />
            같이 남겨주시면 이웃에게 큰 도움이 돼요.
          </p>
        )}

        {/* 가게 신선도 — 선택 입력, 건너뛰어도 완료된다. */}
        {place && (
          <div className="mt-4 flex w-full flex-col gap-3 rounded-2xl bg-bg-neutral-weak p-4 text-left">
            <p className="text-body-14-medium text-fg-neutral">
              <strong className="font-semibold">{place}</strong>, 전반적으로 어땠나요?
              <span className="ml-1 text-caption-12-regular text-fg-neutral-muted">(선택)</span>
            </p>
            <RadioChipRoot
              aria-label="가게 신선도"
              value={rating ?? undefined}
              onValueChange={(v) => setRating(v as StoreReviewRating)}
              className="flex gap-2"
            >
              {RATING_OPTIONS.map((opt) => (
                <RadioChipItem key={opt.key} value={opt.key}>
                  <ChipLabel>{opt.label}</ChipLabel>
                </RadioChipItem>
              ))}
            </RadioChipRoot>
            {rating && (
              <TextField value={comment} onValueChange={(v) => setComment(v.value)} hideCharacterCount>
                <TextFieldInput placeholder="한마디 남겨주세요 (선택)" />
              </TextField>
            )}
          </div>
        )}
      </Scroll>

      <BottomBar>
        <div className="flex flex-col gap-2">
          {place && (
            <ActionButton asChild variant="brandSolid" size="large" className="w-full">
              <Link href={continueHref} onClick={saveReview}>
                이 가게 가격 더 입력하기
              </Link>
            </ActionButton>
          )}
          <ActionButton
            type="button"
            variant="neutralSolid"
            size="large"
            className="w-full"
            onClick={handleGoToPrice}
          >
            시세 보러 가기
          </ActionButton>
        </div>
      </BottomBar>
    </PhoneFrame>
  );
}
