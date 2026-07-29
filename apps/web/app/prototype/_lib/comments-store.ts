"use client";

// 동네 댓글 스토어 — 프로토타입은 localStorage(기기별). 같은 동 사용자만 보는 개념(현재는 동 필터만, 인증 게이트는 TODO).
// 실서비스 전환 시 이 파일만 Spring BFF 호출로 교체.

import { useSyncExternalStore } from "react";

export interface Comment {
  id: string;
  vegetableId: string;
  district: string;
  nickname: string;
  body: string;
  createdAt: string;
}

const STORAGE_KEY = "veg-comments-v1";
const listeners = new Set<() => void>();
let cache: Comment[] | null = null;

/** 시드 댓글(더미) — 삼성동 감자 기준 예시. */
const SEED_COMMENTS: Comment[] = [
  {
    id: "seed-c1",
    vegetableId: "potato",
    district: "삼성동",
    nickname: "청과왕민지",
    body: "여기 진짜 싸요, 저도 어제 샀어요",
    createdAt: "2026-07-24T10:00:00+09:00",
  },
  {
    id: "seed-c2",
    vegetableId: "potato",
    district: "삼성동",
    nickname: "알뜰장보기",
    body: "물건도 좋았어요 추천!",
    createdAt: "2026-07-23T15:30:00+09:00",
  },
];

function readLocal(): Comment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Comment[]) : [];
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

function getSnapshot(): Comment[] {
  if (cache === null) cache = readLocal();
  return cache;
}

function getServerSnapshot(): Comment[] {
  return [];
}

export function addComment(input: { vegetableId: string; district: string; nickname: string; body: string }): void {
  const comment: Comment = {
    id: `local-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    ...input,
    createdAt: new Date().toISOString(),
  };
  const next = [comment, ...readLocal()];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 프라이빗 모드 등 저장 실패 — 새로고침 전까지는 메모리로만 유지
  }
  cache = next;
  listeners.forEach((l) => l());
}

/** 같은 동·같은 품목 댓글만(동네 인증 개념) 최신순. */
export function useComments(vegetableId: string, district: string): Comment[] {
  const local = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const merged = [...local, ...SEED_COMMENTS];
  return merged
    .filter((c) => c.vegetableId === vegetableId && c.district === district)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
