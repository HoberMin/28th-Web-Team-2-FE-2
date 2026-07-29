"use client";

// 가격 알림 설정 스토어 — 찜한 야채마다 켜고 끄는 토글(기기별 localStorage).
// 실제 푸시 발송은 없음(프로토타입) — "매번 시세를 확인하러 와야 한다"는 리스크를 해결하는 UI만 검증.

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "veg-price-alerts-v1";
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
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
  return [];
}

function persist(next: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 프라이빗 모드 등 저장 실패 — 새로고침 전까지는 메모리로만 유지
  }
  cache = next;
  listeners.forEach((l) => l());
}

/** 가격 알림 토글 — 있으면 끄고, 없으면 켠다. */
export function togglePriceAlert(vegetableId: string): void {
  const current = readLocal();
  const next = current.includes(vegetableId)
    ? current.filter((id) => id !== vegetableId)
    : [vegetableId, ...current];
  persist(next);
}

/** 알림 켠 야채 id 목록. */
export function usePriceAlerts(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
