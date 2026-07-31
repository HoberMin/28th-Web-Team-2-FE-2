"use client";

// 알림 설정 스토어 — **전역 토글 하나**(기기별 localStorage).
//
// 이전엔 단골 가게마다 개별 토글이 있었다(`store-alerts-store.ts`, 삭제됨). 대상은 별도 등록
// 없이 "찜한 야채 + 단골 가게"로 이미 정해져 있고(관심 표시가 곧 구독), 트리거도 개별 가게가
// 아니라 "의미 있는 변화 + 하루 1회 다이제스트"로 묶이므로 가게별 스위치가 따로 있을 이유가 없다.
// 개별 끄기가 없는 대신 트리거 기준(`notifications-digest.ts`)이 볼륨을 관리하는 유일한 장치다.
//
// 실제 푸시 발송은 없음(프로토타입) — 토글 상태 + "오늘 이런 알림을 받아요" 미리보기로 설계만 검증.

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "veg-notifications-v1";
const listeners = new Set<() => void>();
let cache: boolean | null = null;

function readLocal(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null ? true : raw === "1";
  } catch {
    return true;
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): boolean {
  if (cache === null) cache = readLocal();
  return cache;
}

function getServerSnapshot(): boolean {
  return true;
}

/** 알림 전체 on/off. */
export function setNotificationsEnabled(next: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    // 프라이빗 모드 등 저장 실패 — 새로고침 전까지는 메모리로만 유지
  }
  cache = next;
  listeners.forEach((l) => l());
}

/** 알림 전체 on/off 상태. */
export function useNotificationsEnabled(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
