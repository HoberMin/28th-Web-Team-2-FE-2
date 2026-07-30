"use client";

// 가게 신선도(만족도) 스토어 — reports-store.ts와 동일 패턴(localStorage + useSyncExternalStore).
// 제보 완료 화면(F04-3)에서 선택 입력으로 받는다. **표시는 이 파일 밖(가게 상세 F09)의 몫** —
// 여기서는 저장·읽기 훅만 제공하고 화면에 그리지 않는다(요구사항: 읽기 훅만 export).

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "veg-store-reviews-v1";
const listeners = new Set<() => void>();

/** 「좋아요 / 보통 / 별로」 3단계. */
export type StoreReviewRating = "good" | "fair" | "bad";

export interface StoreReview {
  id: string;
  /** 가게명(place) — stores.ts 집계와 동일 키로 묶기 위해 place 문자열을 그대로 쓴다. */
  place: string;
  rating: StoreReviewRating;
  /** 한마디(선택) */
  comment?: string;
  createdAt: string;
}

// useSyncExternalStore는 스냅샷 참조가 안정적이어야 함 → 쓰기 때만 교체하는 캐시.
let cache: StoreReview[] | null = null;

function readLocal(): StoreReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoreReview[];
  } catch {
    return [];
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): StoreReview[] {
  if (cache === null) cache = readLocal();
  return cache;
}

function getServerSnapshot(): StoreReview[] {
  return [];
}

export interface NewStoreReviewInput {
  place: string;
  rating: StoreReviewRating;
  comment?: string;
}

/** 가게 신선도 저장 — 완료 화면에서 건너뛰면 호출되지 않는다(선택 입력). */
export function addStoreReview(input: NewStoreReviewInput): StoreReview {
  const review: StoreReview = {
    id: `store-review-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    place: input.place,
    rating: input.rating,
    comment: input.comment?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  const next = [review, ...readLocal()];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 프라이빗 모드 등 저장 실패 — 완료 화면의 "시세 보러 가기" 내비게이션(호출부)을 막지 않게
    // 삼키고, 새로고침 전까지는 메모리로만 유지(comments-store와 같은 정책).
  }
  cache = next;
  listeners.forEach((l) => l());
  return review;
}

/** 특정 가게의 신선도 리뷰를 최신순으로 반환 — 가게 상세(F09)가 소비할 읽기 훅. */
export function useStoreReviews(place: string): StoreReview[] {
  const all = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return all
    .filter((r) => r.place === place)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
