"use client";

import { useFavorites } from "../_lib/favorites-store";
import { useFavoriteStores } from "../_lib/favorite-stores-store";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { buildNotificationDigest } from "../_lib/notifications-digest";
import type { PriceSnapshotMap } from "../_lib/stores";

/**
 * F05-1 설정 화면 「오늘 이런 알림을 받아요」 미리보기.
 *
 * 실제 발송은 없는 프로토타입이라 알림 설계(전역 토글 하나 · 대상은 찜한 야채 + 단골 가게 ·
 * 의미 있는 변화만 · 하루 1회 다이제스트)가 토글 스위치 하나로는 눈에 보이지 않는다.
 * 찜·단골·제보·시세에서 실제로 계산해 한 문장으로 조립한다.
 */
export function NotificationDigestPreview({
  priceMap,
  todayIso,
  enabled,
}: {
  priceMap: PriceSnapshotMap;
  todayIso: string;
  enabled: boolean;
}) {
  const favorites = useFavorites();
  const favoriteStores = useFavoriteStores();
  const { district } = useCurrentDistrict();
  const reports = useReports({ district });

  const digest = buildNotificationDigest({
    favoriteVegetableIds: favorites,
    favoriteStores,
    reports,
    priceMap,
    todayIso,
  });

  const hasTargets = favorites.length > 0 || favoriteStores.length > 0;
  const parts = [
    ...digest.priceDrops.map((p) => `${p.name} ${p.dropPct}% 내렸어요`),
    ...digest.storeReports.map((s) => `${s.store}에 새 제보 ${s.count}건`),
  ];

  return (
    <section
      aria-label="오늘의 알림 미리보기"
      className={`flex flex-col gap-1.5 rounded-2xl bg-bg-neutral-weak px-4 py-3 transition-opacity ${
        enabled ? "" : "opacity-40"
      }`}
    >
      <h3 className="text-body-14-medium text-fg-neutral-muted">
        {/* 흐리게만 처리하면 꺼짐 상태가 색으로만 전달되고, 낭독기는 켜짐과 똑같이 읽는다.
            문구로도 상태를 말해 대비·스크린리더를 함께 해결한다. */}
        {enabled ? "오늘 이런 알림을 받아요" : "알림이 꺼져 있어요 · 켜면 이런 알림을 받아요"}
      </h3>
      {!hasTargets ? (
        <p className="text-body-14-regular text-fg-neutral-muted">
          아직 알림 받을 야채나 가게가 없어요. 찜하거나 단골로 등록해 보세요.
        </p>
      ) : parts.length > 0 ? (
        <p className="text-body-14-regular text-fg-neutral">
          오늘 {district} — {parts.join(" · ")}
        </p>
      ) : (
        <p className="text-body-14-regular text-fg-neutral-muted">
          오늘은 알릴 만큼 큰 변화가 없었어요.
        </p>
      )}
    </section>
  );
}
