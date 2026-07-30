"use client";

// 사용자 제보 크라우드소싱 스토어 — 프로토타입은 localStorage에 저장(기기별 유지).
// 실서비스 전환 시 이 파일만 Spring BFF 호출로 교체하면 화면은 그대로 동작.

import { useSyncExternalStore } from "react";
import { getNeighborhoodSeedReports, MY_SEED_REPORTS } from "./vegetables";
import type { Report } from "./types";

const STORAGE_KEY = "veg-reports-v1";
const listeners = new Set<() => void>();
// useSyncExternalStore는 스냅샷 참조가 안정적이어야 함 → 쓰기 때만 교체하는 캐시.
let cache: Report[] | null = null;

function readLocal(): Report[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    // purchased 도입 전(v1 초기) 레코드엔 필드가 없다 — 당시 모델은 "제보 = 내가 산 가격"이라 true로 정규화.
    const parsed = JSON.parse(raw) as (Omit<Report, "purchased"> & { purchased?: boolean })[];
    return parsed.map((r) => ({ ...r, purchased: r.purchased ?? true }));
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

function getSnapshot(): Report[] {
  if (cache === null) cache = readLocal();
  return cache;
}

function getServerSnapshot(): Report[] {
  return [];
}

export interface NewReportInput {
  vegetableId: string;
  district: string;
  /** 제보 지점(가게명) — 가게 위치 선택(F04-1)에서 넘어옴. 없으면 동까지만. */
  place?: string;
  weightKg: number;
  price: number;
  method: Report["method"];
  /** 이 가격에 실제로 구매했는지("샀어요/안 샀어요"). 구매 내역·절약 계산은 true만 포함. */
  purchased: boolean;
}

export function addReport(input: NewReportInput): Report {
  const report: Report = {
    id: `local-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    vegetableId: input.vegetableId,
    district: input.district,
    place: input.place,
    weightKg: input.weightKg,
    price: input.price,
    pricePerKg: input.weightKg > 0 ? Math.round(input.price / input.weightKg) : input.price,
    createdAt: new Date().toISOString(),
    method: input.method,
    mine: true,
    purchased: input.purchased,
  };
  const next = [report, ...readLocal()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cache = next;
  listeners.forEach((l) => l());
  return report;
}

/**
 * 시드 + 로컬 제보를 합쳐 필터·최신순 정렬해 반환(동네 크라우드소싱 목록).
 * 이웃 시드는 **요청된 동네만** 지연 생성한다(46종 × 전 동네를 미리 만들면 1만 건이 넘음).
 */
export function useReports(filter?: { vegetableId?: string; district?: string }): Report[] {
  const local = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const neighborhood = filter?.district ? getNeighborhoodSeedReports(filter.district) : [];
  const merged = [...local, ...MY_SEED_REPORTS, ...neighborhood];
  const filtered = merged.filter(
    (r) =>
      (!filter?.vegetableId || r.vegetableId === filter.vegetableId) &&
      (!filter?.district || r.district === filter.district),
  );
  return filtered.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/**
 * 내가 올린 제보만(mine=true) 최신순으로 반환 — 마이페이지 "제보/구매 내역"의 소스.
 * 동네 필터는 걸지 않는다(내 기록은 위치와 무관하게 내 것).
 */
export function useMyReports(): Report[] {
  const local = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const merged = [...local, ...MY_SEED_REPORTS].filter((r) => r.mine);
  return merged.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
