"use client";

// 현재 위치(동) 스토어 — 실제 GPS(navigator.geolocation) → BFF 역지오코딩.
// 한 번만 측위하고 결과를 앱 전체가 공유(홈·시세·제보). 권한 거부/키 미수령 시 폴백.

import { useEffect, useSyncExternalStore } from "react";
import { DEFAULT_DISTRICT } from "./vegetables";
import { readOnboarding } from "./onboarding-store";
import { REGIONS } from "./regions";

/**
 * REGIONS(동 단위)에 없는 동이 들어오면 채택하지 않는다 — 실 GPS 응답이 REGIONS가 다루지 않는
 * 동(대표 동 목록 밖)이거나 구 단위로 새면, 그 동네엔 제보·댓글 시드가 전혀 없어 화면이
 * 빈 채로 남는다(사용자가 실제로 겪은 버그). 매칭 실패 시 UT 앵커(DEFAULT_DISTRICT)로 폴백.
 */
function toKnownDistrict(district: string): string {
  return REGIONS.some((r) => r.label === district) ? district : DEFAULT_DISTRICT;
}

type Status = "idle" | "loading" | "done";

/** 동 중심 좌표 — GPS를 못 쓸 때(온보딩 선택·권한 거부) 거리 계산의 기준점이 된다. */
function centerOf(name: string): { lat: number; lng: number } {
  const region = REGIONS.find((r) => r.label === name);
  return { lat: region?.lat ?? 37.514, lng: region?.lng ?? 127.056 };
}

let district = DEFAULT_DISTRICT;
let coords = centerOf(DEFAULT_DISTRICT);
let status: Status = "idle";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
// 스냅샷은 원시 문자열이라 참조가 안정적 → useSyncExternalStore 안전.
function getSnapshot(): string {
  return `${status}|${district}|${coords.lat}|${coords.lng}`;
}
function getServerSnapshot(): string {
  const c = centerOf(DEFAULT_DISTRICT);
  return `idle|${DEFAULT_DISTRICT}|${c.lat}|${c.lng}`;
}

function finish(next: string, nextCoords?: { lat: number; lng: number }) {
  district = next;
  coords = nextCoords ?? centerOf(next);
  status = "done";
  emit();
}

/** 온보딩에서 선택한 지역을 즉시 채택(GPS 측위 생략) — 홈 게이트 리다이렉트 전에도 값이 있도록. */
export function setDistrict(next: string): void {
  finish(next);
}

function ensureLocated() {
  if (status !== "idle") return;

  // 온보딩이 필수 플로우라 완료 시 항상 district가 있음 — 그 값을 진실 소스로 채택하고
  // GPS 측위는 생략한다(안 그러면 GPS가 온보딩에서 고른 지역을 되돌려버리는 회귀가 생김).
  const onboardingDistrict = readOnboarding().district;
  if (onboardingDistrict) {
    finish(onboardingDistrict);
    return;
  }

  status = "loading";
  emit();

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    finish(DEFAULT_DISTRICT);
    return;
  }
  // 권한 프롬프트가 응답 없이 방치되면 geolocation timeout이 안 걸리는 브라우저가 있어
  // "위치 확인 중…"이 무기한 지속되는 것을 막는 안전판.
  setTimeout(() => {
    if (status === "loading") finish(DEFAULT_DISTRICT);
  }, 8000);
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
        const data = (await res.json()) as { district?: string };
        // 좌표는 실측값 그대로 보관한다 — 가게까지의 거리는 동 중심이 아니라 지금 서 있는 자리 기준이라야 쓸모 있다.
        finish(data.district ? toKnownDistrict(data.district) : DEFAULT_DISTRICT, {
          lat: latitude,
          lng: longitude,
        });
      } catch {
        finish(DEFAULT_DISTRICT);
      }
    },
    () => finish(DEFAULT_DISTRICT),
    { timeout: 8000, maximumAge: 300000 },
  );
}

/**
 * 「현재 위치로 찾기」 버튼 전용 측위 — `ensureLocated()`와 달리 "온보딩 값 우선" 분기를 타지
 * 않는다(온보딩 화면 자체에서도 이 버튼을 눌러야 하므로, 온보딩 완료 여부와 무관하게 항상 GPS를
 * 시도해야 한다). 공유 스토어(district/coords)는 건드리지 않고 결과만 반환 — 실제 선택 반영은
 * 호출부가 `onSelect`/`setActiveDistrict` 등으로 명시적으로 한다.
 *
 * 권한 거부·타임아웃·미지원·역지오코딩 실패는 전부 null — 호출부가 에러 화면을 띄우지 않고
 * "조용히 검색 목록으로 남는" 데 쓴다.
 */
export function locateCurrentDistrict(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    let settled = false;
    const settle = (value: string | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    // 권한 프롬프트가 방치되면 geolocation 자체 timeout이 안 걸리는 브라우저가 있어 별도 안전판.
    const timer = setTimeout(() => settle(null), 8000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        clearTimeout(timer);
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
          const data = (await res.json()) as { district?: string };
          settle(data.district ? toKnownDistrict(data.district) : null);
        } catch {
          settle(null);
        }
      },
      () => {
        clearTimeout(timer);
        settle(null);
      },
      { timeout: 8000, maximumAge: 300000 },
    );
  });
}

export function useCurrentDistrict(): { district: string; loading: boolean } {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    ensureLocated();
  }, []);
  const [snapStatus, snapDistrict] = snapshot.split("|");
  return { district: snapDistrict, loading: snapStatus !== "done" };
}

/** 현재 좌표(GPS 실측 또는 동 중심 폴백) — 가게까지의 거리 계산용. */
export function useCurrentCoords(): { lat: number; lng: number } {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    ensureLocated();
  }, []);
  const [, , lat, lng] = snapshot.split("|");
  return { lat: Number(lat), lng: Number(lng) };
}
