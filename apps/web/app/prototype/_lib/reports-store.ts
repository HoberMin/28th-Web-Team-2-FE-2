"use client";

// 사용자 제보 크라우드소싱 스토어 — 프로토타입은 localStorage에 저장(기기별 유지).
// 실서비스 전환 시 이 파일만 Spring BFF 호출로 교체하면 화면은 그대로 동작.

import { useSyncExternalStore } from "react";
import { getNeighborhoodSeedReports, MY_SEED_REPORTS } from "./vegetables";
import { regionsByProximity } from "./regions";
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
 * 제보 가격·양 수정(마이페이지 「내 제보」 ⋯ 메뉴 → 수정 시트). 위치·품목은 바꾸지 않는다
 * (오타 정정이 목적이라 가게 축 집계를 깨지 않게 범위를 좁혔다).
 *
 * ⚠️ 시드 제보(`mine-*`, `vegetables.ts`의 `MY_SEED_REPORTS`)는 localStorage에 없어 대상이 아니다
 * — 호출부(reports-view.tsx)가 `id.startsWith("local-")`인 항목에만 수정 메뉴를 보여준다.
 */
export function updateReport(id: string, patch: { weightKg: number; price: number }): void {
  const next = readLocal().map((r) =>
    r.id === id
      ? {
          ...r,
          weightKg: patch.weightKg,
          price: patch.price,
          pricePerKg: patch.weightKg > 0 ? Math.round(patch.price / patch.weightKg) : patch.price,
        }
      : r,
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cache = next;
  listeners.forEach((l) => l());
}

/** 제보 삭제(마이페이지 「내 제보」 ⋯ 메뉴 → 삭제, 확인 후 호출). 시드 제보는 대상 아님(위 설명 참조). */
export function removeReport(id: string): void {
  const next = readLocal().filter((r) => r.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cache = next;
  listeners.forEach((l) => l());
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
 * 근처 동네 제보 — 우리 동네에 제보가 0건일 때의 폴백(콜드스타트 대응).
 *
 * 왜 필요한가: 제보가 없는 동네는 화면 대부분이 빈 상태가 된다. 크라우드소싱 서비스의
 * 첫 사용자는 항상 이 상태를 만나고, 빈 화면만 보면 "쓸 데이터가 없는 앱"으로 판단하고 떠난다.
 * 가까운 동네 가격은 우리 동네만큼 정확하진 않지만 **아무것도 없는 것보다 낫고**,
 * 어느 동네 값인지 밝히면 오해도 없다.
 */
export function useNearbyDistrictReports(
  vegetableId: string,
  district: string,
  limit = 3,
): Array<{ district: string; reports: Report[] }> {
  // regionsByProximity 기본 limit(4)은 "지금 있는 동네" 추천용 — 여기는 자기 자신을 제외하고도
  // 6개 후보가 필요해 더 넉넉히 받는다(self + 6).
  const nearby = regionsByProximity(district, 7)
    // 첫 항목은 자기 자신 → 제외
    .filter((r) => r.label !== district)
    .slice(0, 6);

  const groups: Array<{ district: string; reports: Report[] }> = [];
  for (const region of nearby) {
    const reports = getNeighborhoodSeedReports(region.label)
      .filter((r) => r.vegetableId === vegetableId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    if (reports.length === 0) continue;
    groups.push({ district: region.label, reports });
    if (groups.length >= limit) break;
  }
  return groups;
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
