"use client";

// 온보딩(닉네임·동네) 스토어 — reports-store.ts와 동일 패턴(localStorage + useSyncExternalStore).
// 실서비스 전환 시 이 파일만 Spring BFF 호출로 교체하면 화면은 그대로 동작.

import { useSyncExternalStore } from "react";
import { setDistrict } from "./location";

const STORAGE_KEY = "veg-onboarding-v1";
const listeners = new Set<() => void>();

/** 등록 가능한 동네 최대 개수 — 초과 등록 시 가장 오래된 것부터 밀려난다. */
const MAX_DISTRICTS = 3;

export interface OnboardingState {
  nickname: string;
  /** 지금 활성화된 동네 — 20개+ 소비처가 이 단일 값을 읽으므로 배열로 바꾸지 않는다. */
  district: string;
  /** 등록된 동네 목록(최대 3개). 활성은 항상 `district` 하나. */
  districts: string[];
  completed: boolean;
  /**
   * 프로필 아바타 id(`profile-avatar.tsx`의 `AVATAR_OPTIONS` id) — 빈 문자열이면 기본 아이콘.
   * 새 에셋 없이 기존 야채 일러스트 8종을 재사용한다(설정 화면 §프로필 이미지).
   */
  avatar: string;
}

const DEFAULT_STATE: OnboardingState = {
  nickname: "",
  district: "",
  districts: [],
  completed: false,
  avatar: "",
};

// useSyncExternalStore는 스냅샷 참조가 안정적이어야 함 → 쓰기 때만 교체하는 캐시.
let cache: OnboardingState | null = null;

/** v1 저장값(`districts` 없음) 마이그레이션 — 있던 단일 `district`를 등록 목록의 첫 항목으로 채운다. */
function migrate(state: OnboardingState): OnboardingState {
  if (state.districts.length > 0 || !state.district) return state;
  return { ...state, districts: [state.district] };
}

function readLocal(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    return migrate({ ...DEFAULT_STATE, ...parsed });
  } catch {
    return DEFAULT_STATE;
  }
}

/** 등록 목록에 동네를 추가(중복 무시) — 3개 초과 시 가장 오래된(맨 앞) 항목을 제거. */
function withDistrict(list: string[], name: string): string[] {
  if (list.includes(name)) return list;
  const next = [...list, name];
  return next.length > MAX_DISTRICTS ? next.slice(next.length - MAX_DISTRICTS) : next;
}

function persist(next: OnboardingState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 프라이빗 모드 등 저장 실패 — 인메모리 캐시는 진행시켜 게이트 무한 리다이렉트를 막는다.
  }
  cache = next;
  listeners.forEach((l) => l());
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

/**
 * 온보딩 상태 갱신(부분 patch) — nickname/district 입력 진행 중에도 사용 가능.
 * `patch.district`가 있으면 등록 목록(`districts`)에도 자동 반영(온보딩 완료 시 첫 등록이 되도록).
 */
export function setOnboarding(patch: Partial<OnboardingState>): void {
  const current = readLocal();
  const next: OnboardingState = { ...current, ...patch };
  if (patch.district) {
    next.districts = withDistrict(next.districts, patch.district);
  }
  persist(next);
}

/** 동네 등록(최대 3개, 초과 시 가장 오래된 것 제거). 활성 동네는 바꾸지 않는다. */
export function addDistrict(name: string): void {
  const current = readLocal();
  persist({ ...current, districts: withDistrict(current.districts, name) });
}

/** 등록 해제. 해제 대상이 현재 활성 동네여도 `district`는 그대로 둔다(활성 전환은 `setActiveDistrict`가 담당). */
export function removeDistrict(name: string): void {
  const current = readLocal();
  persist({ ...current, districts: current.districts.filter((d) => d !== name) });
}

/**
 * 활성 동네 전환 — 기존 `district` 갱신 + 등록 목록에 없으면 추가 + `location.ts`의 런타임
 * 스토어(`setDistrict`)까지 동기화한다. 20개+ 소비처가 `district` 단일 값을 읽으므로 이 함수가
 * 유일한 "동네 바꾸기" 진입점이어야 한다.
 */
export function setActiveDistrict(name: string): void {
  const current = readLocal();
  persist({ ...current, district: name, districts: withDistrict(current.districts, name) });
  setDistrict(name);
}

/** 온보딩 상태 훅 — 화면에서 실시간 구독. */
export function useOnboarding(): OnboardingState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** 등록된 동네 목록 훅 — 홈 drawer·설정 화면의 "등록된 동네" 목록에서 사용. */
export function useDistricts(): string[] {
  return useOnboarding().districts;
}

/**
 * 훅이 아닌 non-reactive 읽기 — 게이트(마운트 후 1회 체크)·location.ts(모듈 스코프)에서 사용.
 * SSR/서버 환경에서도 안전(window 가드).
 */
export function readOnboarding(): OnboardingState {
  // 캐시 우선 — 저장 실패(프라이빗 모드) 시에도 세션 내 완료 상태를 게이트가 인식해 루프를 막는다.
  return cache ?? readLocal();
}
