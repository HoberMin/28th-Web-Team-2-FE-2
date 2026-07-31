// 알림 다이제스트 계산 — 설정(F05-1) 「오늘 이런 알림을 받아요」 미리보기의 근거.
// 순수 함수(서버·클라 공용). 실제 발송 인프라는 없다(프로토타입) — 알림 설계
// (대상은 찜한 야채 + 단골 가게, 트리거는 의미 있는 변화만, 하루 1회 다이제스트)를
// 눈에 보이게 하는 게 목적이라 토글 하나만 있고서는 뭘 받는지 알 길이 없다.
//
// 대상: 별도 등록 없이 찜한 야채 + 단골 가게(관심 표시가 곧 구독).
// 트리거: 찜한 야채는 최근 평균 대비 하락, 단골 가게는 시세보다 싼 새 제보. 매일의 등락 전부가
// 아니다 — 알림이 전역 토글 하나뿐이라(개별 끄기 없음) 트리거 기준이 볼륨을 관리하는 유일한 장치.

import type { Report } from "./types";
import { getReportAge, isOutlier, type PriceSnapshotMap } from "./stores";
import { getVegetable } from "./vegetables";

/**
 * ⚠️ 근거 없는 초기값(결정 필요 — `shared/detail-features.md` 「알림」 항목 참조).
 * 하루 한 번 묶어 보내는 다이제스트라도 절대 기준 없이 자주 울리면 매일 오는 잡음이 된다.
 */
export const PRICE_DROP_THRESHOLD_PCT = 10;

/**
 * ⚠️ 근거 없는 초기값. "새로 올라온" 제보로 볼 기준일수 — 다이제스트가 하루 1회라 최근 1일로 잡았다.
 */
export const NEW_REPORT_WINDOW_DAYS = 1;

export interface PriceDropDigestItem {
  vegetableId: string;
  name: string;
  /** 최근 평균 대비 하락률(%, 양수) */
  dropPct: number;
}

export interface StoreReportDigestItem {
  store: string;
  count: number;
}

export interface NotificationDigest {
  priceDrops: PriceDropDigestItem[];
  storeReports: StoreReportDigestItem[];
}

export interface BuildNotificationDigestInput {
  /** 찜한 야채 id 목록 */
  favoriteVegetableIds: string[];
  /** 단골 가게 이름 목록 */
  favoriteStores: string[];
  /** 다이제스트 대상 동네의 제보(시드+로컬 합본) */
  reports: Report[];
  /** 품목별 {오늘 시세, 최근 평균} — 서버에서 내려온 값(클라 재계산 금지) */
  priceMap: PriceSnapshotMap;
  todayIso: string;
}

/** 찜한 야채 중 최근 평균 대비 임계값 이상 하락한 품목 + 단골 가게 중 오늘 싼 제보가 새로 올라온 곳. */
export function buildNotificationDigest(input: BuildNotificationDigestInput): NotificationDigest {
  const { favoriteVegetableIds, favoriteStores, reports, priceMap, todayIso } = input;

  const priceDrops: PriceDropDigestItem[] = [];
  for (const id of favoriteVegetableIds) {
    const snapshot = priceMap[id];
    if (!snapshot || snapshot.current === null || !snapshot.average || snapshot.average <= 0) {
      continue;
    }
    const dropPct = Math.round(((snapshot.average - snapshot.current) / snapshot.average) * 1000) / 10;
    if (dropPct < PRICE_DROP_THRESHOLD_PCT) continue;
    const veg = getVegetable(id);
    priceDrops.push({ vegetableId: id, name: veg?.name ?? id, dropPct });
  }
  priceDrops.sort((a, b) => b.dropPct - a.dropPct);

  const storeReports: StoreReportDigestItem[] = [];
  for (const store of favoriteStores) {
    const count = reports.filter((r) => {
      if (r.place !== store) return false;
      if (getReportAge(r.createdAt, todayIso).days > NEW_REPORT_WINDOW_DAYS) return false;
      const baseline = priceMap[r.vegetableId]?.current ?? null;
      if (baseline === null || r.pricePerKg >= baseline) return false;
      // 이상치(시세 3배/⅓ 밖) 제보는 제외 — 가게 요약(`summarizeStores`)과 같은 잣대.
      // 오타 제보 하나가 "새 제보 알림"으로 울리면 트리거 기준이 볼륨을 관리한다는 전제가 깨진다.
      return !isOutlier(r.pricePerKg, baseline);
    }).length;
    if (count > 0) storeReports.push({ store, count });
  }
  storeReports.sort((a, b) => b.count - a.count);

  return { priceDrops, storeReports };
}
