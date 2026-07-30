"use client";

// 단골 가게 스토어 — 찜(야채)과 같은 localStorage 패턴이지만 **가게 축**이다.
// 왜 필요한가: 반복 구매가 타깃의 특성이라 매번 가게를 다시 찾는 건 노력 낭비다.
// 단골을 등록해두면 홈에서 "단골집 오늘 가격"을 먼저 볼 수 있다.
// 실서비스 전환 시 이 파일만 Spring BFF 호출로 교체하면 화면은 그대로 동작.

import { useSyncExternalStore } from "react";

/** 데모 시드 — 첫 방문에도 홈 "단골집" 카드가 비지 않게. 삼성동 실제 상권 이름. */
const SEED_FAVORITE_STORES: string[] = ["우리농산물가락직판장"];

const STORAGE_KEY = "veg-favorite-stores-v1";
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null ? [...SEED_FAVORITE_STORES] : (JSON.parse(raw) as string[]);
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

function getSnapshot(): string[] {
  if (cache === null) cache = readLocal();
  return cache;
}

function getServerSnapshot(): string[] {
  // 모듈 상수(참조 안정) → 첫 방문 SSR/하이드레이션에도 시드가 채워져 플래시 없음.
  return SEED_FAVORITE_STORES;
}

function persist(next: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cache = next;
  listeners.forEach((l) => l());
}

/** 단골 토글 — 있으면 제거, 없으면 추가. */
export function toggleFavoriteStore(name: string): void {
  const current = readLocal();
  const next = current.includes(name) ? current.filter((n) => n !== name) : [name, ...current];
  persist(next);
}

/** 단골 가게 이름 목록(추가 최신순). */
export function useFavoriteStores(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** 특정 가게의 단골 여부. */
export function useIsFavoriteStore(name: string): boolean {
  const stores = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return stores.includes(name);
}
