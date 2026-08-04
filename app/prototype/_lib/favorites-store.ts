"use client";

// 찜(관심 야채) 스토어 — 제보 스토어와 동일하게 localStorage(기기별 유지).
// 실서비스 전환 시 이 파일만 Spring BFF 호출로 교체하면 화면은 그대로 동작.

import { useSyncExternalStore } from "react";
import { SEED_FAVORITES } from "./vegetables";

const STORAGE_KEY = "veg-favorites-v1";
const listeners = new Set<() => void>();
// useSyncExternalStore는 스냅샷 참조가 안정적이어야 함 → 쓰기 때만 교체하는 캐시.
let cache: string[] | null = null;

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    // 최초 방문(키 없음)엔 데모 시드를 초기값으로 — 저장은 첫 토글 때 일어난다.
    return raw === null ? [...SEED_FAVORITES] : (JSON.parse(raw) as string[]);
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
  // 모듈 상수(참조 안정) 반환 → 첫 방문 SSR/하이드레이션에도 시드 찜이 채워져 플래시 없음.
  return SEED_FAVORITES;
}

function persist(next: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cache = next;
  listeners.forEach((l) => l());
}

/** 찜 토글 — 있으면 제거, 없으면 추가. */
export function toggleFavorite(vegetableId: string): void {
  const current = readLocal();
  const next = current.includes(vegetableId)
    ? current.filter((id) => id !== vegetableId)
    : [vegetableId, ...current];
  persist(next);
}

/** 찜한 야채 id 목록(찜한 순서 = 추가 최신순). */
export function useFavorites(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** 특정 야채의 찜 여부. */
export function useIsFavorite(vegetableId: string): boolean {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return favorites.includes(vegetableId);
}
