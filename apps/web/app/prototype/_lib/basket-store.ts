"use client";

// 장바구니(F07) 스토어 — "장보기 전 예산 계획" 컨셉. 제보를 묶는 게 아니라 품목+수량만 담아
// KAMIS 시세 기준으로 예상 총액을 미리 가늠하는 용도(실 구매는 여전히 F04-2 제보 플로우가 담당).
// favorites-store.ts와 동일한 localStorage + useSyncExternalStore 패턴.

import { useSyncExternalStore } from "react";

export interface BasketItem {
  vegetableId: string;
  weightKg: number;
}

const STORAGE_KEY = "veg-basket-v1";
const listeners = new Set<() => void>();
let cache: BasketItem[] | null = null;

function readLocal(): BasketItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BasketItem[]) : [];
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

function getSnapshot(): BasketItem[] {
  if (cache === null) cache = readLocal();
  return cache;
}

function getServerSnapshot(): BasketItem[] {
  return [];
}

function persist(next: BasketItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 프라이빗 모드 등 저장 실패 — 새로고침 전까지는 메모리로만 유지
  }
  cache = next;
  listeners.forEach((l) => l());
}

// ⚠️ 뮤테이션은 readLocal()이 아니라 getSnapshot()(메모리 cache)을 읽는다 —
// persist()가 저장 실패를 삼키는 설계라, localStorage를 직독하면 프라이빗 모드에서
// "메모리로만 유지" 중인 항목이 다음 쓰기 때 유실된다.

/** 담기 — 이미 담겨있으면 수량을 더한다. */
export function addToBasket(vegetableId: string, weightKg: number): void {
  const current = getSnapshot();
  const existing = current.find((i) => i.vegetableId === vegetableId);
  const next = existing
    ? current.map((i) => (i.vegetableId === vegetableId ? { ...i, weightKg: i.weightKg + weightKg } : i))
    : [...current, { vegetableId, weightKg }];
  persist(next);
}

/** 수량 변경 — 0 이하가 되면 목록에서 제거. */
export function setBasketWeight(vegetableId: string, weightKg: number): void {
  const current = getSnapshot();
  const next =
    weightKg <= 0
      ? current.filter((i) => i.vegetableId !== vegetableId)
      : current.map((i) => (i.vegetableId === vegetableId ? { ...i, weightKg } : i));
  persist(next);
}

export function removeFromBasket(vegetableId: string): void {
  persist(getSnapshot().filter((i) => i.vegetableId !== vegetableId));
}

/** 장보기 완료 — 담은 목록을 비운다(매장 모드에서 제보까지 끝낸 뒤 호출). */
export function clearBasket(): void {
  persist([]);
}

export function useBasket(): BasketItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
