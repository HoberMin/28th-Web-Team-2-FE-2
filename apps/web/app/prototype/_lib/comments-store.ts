"use client";

// 동네 댓글 스토어 — 프로토타입은 localStorage(기기별). 같은 동 사용자만 보는 개념(현재는 동 필터만, 인증 게이트는 TODO).
// 실서비스 전환 시 이 파일만 Spring BFF 호출로 교체.

import { useSyncExternalStore } from "react";
import { getVegetable } from "./vegetables";

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

// 시드 댓글 — 동네×품목마다 결정적으로 생성한다.
//
// 왜 미리 다 만들어두지 않나: 46종 × 100여 개 동을 전부 배열로 들고 있으면 만 건이 넘어
// 렌더마다 필터 비용이 커진다. 제보 시드와 같은 방식으로 **요청된 조합만** 만들고 캐시한다.
// 임의값(Math.random)이 아니라 해시 seed라 매 렌더 같은 결과가 나온다.

const NICKNAME_POOL = [
  "청과왕민지",
  "알뜰장보기",
  "세아이엄마",
  "동네한바퀴",
  "장바구니요정",
  "매일저녁찬거리",
  "주말장보기",
  "냉장고파먹기",
];

const BODY_TEMPLATES = [
  (name: string) => `여기 ${name} 진짜 싸요, 저도 어제 샀어요`,
  () => "물건도 좋았어요 추천!",
  (name: string) => `오늘 가보니 ${name} 값이 좀 올랐더라고요`,
  () => "아침 일찍 가면 좋은 걸로 골라주세요",
  (name: string) => `${name}은 여기가 제일 낫던데요`,
  () => "주말엔 사람 많아서 평일에 가는 게 나아요",
  (name: string) => `저번 주보다 ${name} 싸졌네요, 지금이 살 때인 듯`,
  () => "단골인데 요즘 물건 상태 좋아요",
];

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) % 1_000_003;
  }
  return h;
}

/** 기준일 — 제보 시드와 같은 앵커를 써야 "3일 전"이 화면마다 어긋나지 않는다. */
const ANCHOR = Date.parse("2026-07-24T12:00:00+09:00");

const seedCache = new Map<string, Comment[]>();

function getSeedComments(vegetableId: string, district: string): Comment[] {
  const key = `${district}-${vegetableId}`;
  const cached = seedCache.get(key);
  if (cached) return cached;

  const name = getVegetable(vegetableId)?.name ?? "이 야채";
  const seed = hashSeed(key);
  const count = 2 + (seed % 2); // 2~3개

  const comments: Comment[] = [];
  for (let i = 0; i < count; i++) {
    const pick = (seed + i * 17) % BODY_TEMPLATES.length;
    const daysAgo = (seed + i * 3) % 6;
    comments.push({
      id: `seed-${key}-${i}`,
      vegetableId,
      district,
      nickname: NICKNAME_POOL[(seed + i * 5) % NICKNAME_POOL.length],
      body: BODY_TEMPLATES[pick](name),
      createdAt: new Date(ANCHOR - daysAgo * 86_400_000 - i * 3_600_000).toISOString(),
    });
  }

  seedCache.set(key, comments);
  return comments;
}

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
  const mine = local.filter((c) => c.vegetableId === vegetableId && c.district === district);
  return [...mine, ...getSeedComments(vegetableId, district)].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}
