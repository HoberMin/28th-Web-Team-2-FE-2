"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import IconHeartLine from "@karrotmarket/react-monochrome-icon/IconHeartLine";
import IconArticleLine from "@karrotmarket/react-monochrome-icon/IconArticleLine";
import IconReceiptLine from "@karrotmarket/react-monochrome-icon/IconReceiptLine";
import IconStoreLine from "@karrotmarket/react-monochrome-icon/IconStoreLine";
import IconBellLine from "@karrotmarket/react-monochrome-icon/IconBellLine";
import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";
import { useFavorites } from "../_lib/favorites-store";
import { useMyReports } from "../_lib/reports-store";
import { useFavoriteStores } from "../_lib/favorite-stores-store";
import { useStoreAlerts } from "../_lib/store-alerts-store";
import { useCurrentDistrict } from "../_lib/location";
import { useOnboarding } from "../_lib/onboarding-store";
import type { PriceMap } from "../_lib/stores";
import { ProfileAvatar } from "./profile-avatar";
import { BadgeList } from "./badge-list";
import { SavingsCard } from "./weekly-report";

// F05 마이페이지 본문 — 허브형. 값으로 봐야 하는 것(프로필·절약·뱃지)만 상단에 남기고
// 목록으로 훑는 것(찜/제보/구매/단골/알림)은 리스트 메뉴 뒤로 보낸다(백로그 F05 참조).
// 찜/제보/구매/단골 가게/설정의 실제 목록·상세는 각 하위 라우트(`mypage/*`)로 옮겨졌다.
//
// priceMap은 서버(getPriceMap())에서 내려온 오늘 시세 — 절약 카드가 홈·시세 화면과 같은
// 기준을 쓰게 한다(예전엔 SavingsCard가 더미 기준선을 직접 썼다, F05 버그 항목).
export function MyPageContent({ todayIso, priceMap }: { todayIso: string; priceMap: PriceMap }) {
  const { district, loading } = useCurrentDistrict();
  const { nickname, avatar } = useOnboarding();
  const favorites = useFavorites();
  const myReports = useMyReports();
  const favoriteStores = useFavoriteStores();
  const storeAlerts = useStoreAlerts();

  // 제보 = 내 제보 전체(샀든 안 샀든), 구매 = 실제로 산 것(purchased)만.
  const purchases = myReports.filter((r) => r.purchased);
  // 온보딩에서 설정한 닉네임 우선, 없으면 동네 이웃으로 폴백.
  const displayName = nickname || (loading ? "우리 동네 이웃" : `${district} 이웃`);

  return (
    <div className="flex flex-col gap-6 px-4 pt-1 pb-10">
      {/* 프로필 */}
      <div className="flex items-center gap-3">
        <ProfileAvatar avatarId={avatar} size={64} />
        <div className="flex min-w-0 flex-col">
          <p className="text-head2-18 text-fg-neutral">{displayName}</p>
          <p className="text-body-14-regular text-fg-neutral-muted">
            {loading ? "위치 확인 중…" : district}
          </p>
        </div>
      </div>

      {/* 절약 카드 — 누적/이번 주를 세그먼트 토글 하나로 합친다(핵심 가치: 눈으로 보는 변화) */}
      <SavingsCard todayIso={todayIso} priceMap={priceMap} />

      {/* 뱃지 — 구매인증(제보) 원동력 */}
      <BadgeList reportCount={myReports.length} purchaseCount={purchases.length} />

      {/* 리스트 메뉴 — 항목이 6개뿐이라 아이콘 그리드보다, 개수를 먼저 보여주는 리스트가 낫다 */}
      <nav aria-label="마이페이지 메뉴" className="flex flex-col">
        <MenuRow
          href="/prototype/mypage/favorites"
          icon={<IconHeartLine />}
          label="찜한 야채"
          value={`${favorites.length}개`}
        />
        <MenuRow
          href="/prototype/mypage/reports"
          icon={<IconArticleLine />}
          label="내 제보"
          value={`${myReports.length}건`}
        />
        <MenuRow
          href="/prototype/mypage/purchases"
          icon={<IconReceiptLine />}
          label="구매"
          value={`${purchases.length}건`}
        />
        <MenuRow
          href="/prototype/mypage/stores"
          icon={<IconStoreLine />}
          label="단골 가게"
          value={`${favoriteStores.length}곳`}
        />
        <MenuRow
          href="/prototype/mypage/stores"
          icon={<IconBellLine />}
          label="매장 알림"
          value={`${storeAlerts.length}개 켜짐`}
        />
      </nav>
    </div>
  );
}

function MenuRow({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-14 items-center gap-3 border-b border-bg-neutral-weak text-left last:border-b-0 active:bg-bg-neutral-weak"
    >
      <span
        className="flex size-6 items-center justify-center text-fg-neutral-muted [&_svg]:size-5"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="flex-1 text-body-16-regular text-fg-neutral">{label}</span>
      <span className="text-body-14-regular text-fg-neutral-muted">{value}</span>
      <span className="text-fg-neutral-muted [&_svg]:size-4" aria-hidden="true">
        <IconChevronRightLine />
      </span>
    </Link>
  );
}
