"use client";

// 온보딩(닉네임·동네) 스토어 — reports-store.ts와 동일 패턴(localStorage + useSyncExternalStore).
// 실서비스 전환 시 이 파일만 Spring BFF 호출로 교체하면 화면은 그대로 동작.

import { useSyncExternalStore } from "react";
import { setDistrict } from "./location";
import { ROUTES } from "./routes";

const STORAGE_KEY = "veg-onboarding-v1";
const listeners = new Set<() => void>();

/** 등록 가능한 동네 최대 개수 — 초과 등록 시 가장 오래된 것부터 밀려난다. */
const MAX_DISTRICTS = 3;

/**
 * 로그인 수단 — `""`는 아직 F00-0(서비스 소개·로그인)을 통과하지 않은 상태다.
 * `guest`는 이전 시안의 「먼저 둘러볼게요」로 들어온 저장값과의 호환을 위해서만 유지한다.
 * 프로토타입이라 실제 카카오 OAuth 대신 목업 인증을 쓴다(`kakao-auth.ts`).
 */
export type AuthProvider = "" | "kakao" | "guest";

export interface OnboardingState {
  /** F00-0 통과 여부 겸 회원/비회원 구분. 재진입 규칙의 첫 분기 기준. */
  authProvider: AuthProvider;
  nickname: string;
  /** 지금 활성화된 동네 — 20개+ 소비처가 이 단일 값을 읽으므로 배열로 바꾸지 않는다. */
  district: string;
  /** Spring 품목 조회에 넘기는 10자리 법정동 코드. */
  regionId: string;
  /** Spring이 내려준 전체 법정동 이름. `district`는 기존 프로토타입 소비자용 짧은 이름이다. */
  regionName: string;
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
  authProvider: "",
  nickname: "",
  district: "",
  regionId: "",
  regionName: "",
  districts: [],
  completed: false,
  avatar: "",
};

// useSyncExternalStore는 스냅샷 참조가 안정적이어야 함 → 쓰기 때만 교체하는 캐시.
let cache: OnboardingState | null = null;

/**
 * 저장값 마이그레이션.
 * - v1(`districts` 없음): 있던 단일 `district`를 등록 목록의 첫 항목으로 채운다.
 * - v2(`authProvider` 없음): 이미 온보딩을 마친 사람은 `kakao`로 본다. 안 그러면 F00-0 신설로
 *   기존 사용자가 전부 소개 화면으로 튕긴다.
 * - v3(`regionName` 없음): 예전 짧은 동네 이름을 표시 이름으로 보존한다. regionId는 추측하지 않는다.
 */
function migrate(state: OnboardingState): OnboardingState {
  let next = state;
  if (!next.authProvider && next.completed) next = { ...next, authProvider: "kakao" };
  if (next.districts.length === 0 && next.district) next = { ...next, districts: [next.district] };
  if (!next.regionName && next.district) next = { ...next, regionName: next.district };
  return next;
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

/**
 * 재진입 규칙(F00-0 §재진입) — 지금 상태에서 보내야 할 온보딩 화면. 완료됐으면 `null`.
 *
 * 각 단계는 통과 즉시 저장하므로, 앱을 껐다 켜면 멈춘 자리부터 이어간다.
 * 카카오 인증을 이미 마친 사람에게 인증을 다시 시키지 않는 게 이 함수의 존재 이유다.
 */
export function nextOnboardingRoute(state: OnboardingState): string | null {
  // Figma의 소개·닉네임·지역 선택은 한 경로 안에서 상태로 전환한다. 각 단계의 입력은 통과 즉시
  // 저장되므로 어느 미완료 상태든 `/onboarding`에서 저장값에 맞는 단계부터 이어진다.
  if (!state.authProvider) return ROUTES.onboarding;
  if (!state.completed) return ROUTES.onboarding;
  return null;
}
