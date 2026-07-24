"use client";

// 현재 위치(자치구) 스토어 — 실제 GPS(navigator.geolocation) → BFF 역지오코딩.
// 한 번만 측위하고 결과를 앱 전체가 공유(홈·시세·제보). 권한 거부/키 미수령 시 폴백.

import { useEffect, useSyncExternalStore } from "react";
import { DEFAULT_DISTRICT } from "./vegetables";

type Status = "idle" | "loading" | "done";

let district = DEFAULT_DISTRICT;
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
  return `${status}|${district}`;
}
function getServerSnapshot(): string {
  return `idle|${DEFAULT_DISTRICT}`;
}

function finish(next: string) {
  district = next;
  status = "done";
  emit();
}

function ensureLocated() {
  if (status !== "idle") return;
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
        finish(data.district || DEFAULT_DISTRICT);
      } catch {
        finish(DEFAULT_DISTRICT);
      }
    },
    () => finish(DEFAULT_DISTRICT),
    { timeout: 8000, maximumAge: 300000 },
  );
}

export function useCurrentDistrict(): { district: string; loading: boolean } {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    ensureLocated();
  }, []);
  const [snapStatus, snapDistrict] = snapshot.split("|");
  return { district: snapDistrict, loading: snapStatus !== "done" };
}
