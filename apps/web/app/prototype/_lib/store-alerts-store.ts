"use client";

// 매장 알림 설정 스토어 — **단골 가게마다** 켜고 끄는 토글(기기별 localStorage).
//
// 왜 품목이 아니라 가게인가: 이전엔 찜한 야채별 알림이었는데, 알림을 받아도 "그래서 어디로 가지?"가
// 남아 행동으로 이어지지 않았다. 단골 가게에 더 싼 제보가 올라왔다는 알림은 목적지가 이미 붙어 있다.
// (알림 개념도 하나로 줄어든다 — 품목 알림 + 가게 알림 두 체계를 배우게 하지 않는다.)
//
// 실제 푸시 발송은 없음(프로토타입) — "매번 시세를 확인하러 와야 한다"는 리스크를 푸는 UI만 검증.
// TODO(✍️): 알림 트리거 기준 미정 — 그 가게 기존 최저가 갱신 / 시세 대비 일정 % 이상 저가 중 택.

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "veg-store-alerts-v1";
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

/** 매장 알림 토글 — 있으면 끄고, 없으면 켠다. */
export function toggleStoreAlert(storeName: string): void {
  const current = getSnapshot();
  const next = current.includes(storeName)
    ? current.filter((name) => name !== storeName)
    : [storeName, ...current];
  persist(next);
}

/** 알림 켠 가게 이름 목록. */
export function useStoreAlerts(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
