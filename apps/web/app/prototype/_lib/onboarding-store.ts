"use client";

// 온보딩(닉네임·동네) 스토어 — reports-store.ts와 동일 패턴(localStorage + useSyncExternalStore).
// 실서비스 전환 시 이 파일만 Spring BFF 호출로 교체하면 화면은 그대로 동작.

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "veg-onboarding-v1";
const listeners = new Set<() => void>();

export interface OnboardingState {
  nickname: string;
  district: string;
  completed: boolean;
}

const DEFAULT_STATE: OnboardingState = { nickname: "", district: "", completed: false };

// useSyncExternalStore는 스냅샷 참조가 안정적이어야 함 → 쓰기 때만 교체하는 캐시.
let cache: OnboardingState | null = null;

function readLocal(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<OnboardingState>) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): OnboardingState {
  if (cache === null) cache = readLocal();
  return cache;
}

function getServerSnapshot(): OnboardingState {
  return DEFAULT_STATE;
}

/** 온보딩 상태 갱신(부분 patch) — nickname/district 입력 진행 중에도 사용 가능. */
export function setOnboarding(patch: Partial<OnboardingState>): void {
  const next = { ...readLocal(), ...patch };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cache = next;
  listeners.forEach((l) => l());
}

/** 온보딩 상태 훅 — 화면에서 실시간 구독. */
export function useOnboarding(): OnboardingState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * 훅이 아닌 non-reactive 읽기 — 게이트(마운트 후 1회 체크)·location.ts(모듈 스코프)에서 사용.
 * SSR/서버 환경에서도 안전(window 가드).
 */
export function readOnboarding(): OnboardingState {
  return readLocal();
}
