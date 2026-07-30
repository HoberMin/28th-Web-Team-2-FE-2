"use client";

// 동네 가게 댓글 스토어 — 프로토타입은 localStorage(기기별).
// ⚠️ F03(시세 화면)→F09(가게 상세) 이동에 맞춰 스코프를 품목(vegetableId)에서 **가게(storeName)**로
// 바꿨다(백로그 F03 #12). 화제가 원래 가게 단위라, 46종×동네로 흩으면 밀도가 안 남는다는 판단.
// 이 파일은 F03 작업 소유 범위 밖이라 스코프 변경에 필요한 최소 수정만 했다 — district 필터(동네
// 인증 개념)는 가게 자체가 이미 한 동네에 속하므로 제거했고, 저장 키는 v1→v2로 올려
// (구 shape을 신뢰하지 않고) 조용히 새로 시작하게 했다.
// 실서비스 전환 시 이 파일만 Spring BFF 호출로 교체.

import { useSyncExternalStore } from "react";

export interface Comment {
  id: string;
  storeName: string;
  nickname: string;
  body: string;
  createdAt: string;
}

const STORAGE_KEY = "veg-comments-v2";
const listeners = new Set<() => void>();
let cache: Comment[] | null = null;

// 시드 댓글 — 가게마다 결정적으로 생성한다(Math.random 없이 해시 seed라 매 렌더 같은 결과).
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

const BODY_TEMPLATES: Array<(store: string) => string> = [
  (store) => `${store} 진짜 싸요, 저도 어제 샀어요`,
  () => "물건도 좋았어요 추천!",
  (store) => `오늘 ${store} 가보니 값이 좀 올랐더라고요`,
  () => "아침 일찍 가면 좋은 걸로 골라주세요",
  (store) => `${store}은 여기가 제일 낫던데요`,
  () => "주말엔 사람 많아서 평일에 가는 게 나아요",
  (store) => `저번 주보다 ${store} 물건이 좋아졌어요`,
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

function getSeedComments(storeName: string): Comment[] {
  const cached = seedCache.get(storeName);
  if (cached) return cached;

  const seed = hashSeed(storeName);
  const count = 2 + (seed % 2); // 2~3개

  const comments: Comment[] = [];
  for (let i = 0; i < count; i++) {
    const pick = (seed + i * 17) % BODY_TEMPLATES.length;
    const daysAgo = (seed + i * 3) % 6;
    comments.push({
      id: `seed-${storeName}-${i}`,
      storeName,
      nickname: NICKNAME_POOL[(seed + i * 5) % NICKNAME_POOL.length],
      body: BODY_TEMPLATES[pick](storeName),
      createdAt: new Date(ANCHOR - daysAgo * 86_400_000 - i * 3_600_000).toISOString(),
    });
  }

  seedCache.set(storeName, comments);
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

export function addComment(input: { storeName: string; nickname: string; body: string }): void {
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

/** 같은 가게 댓글만 최신순. */
export function useComments(storeName: string): Comment[] {
  const local = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mine = local.filter((c) => c.storeName === storeName);
  return [...mine, ...getSeedComments(storeName)].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}
