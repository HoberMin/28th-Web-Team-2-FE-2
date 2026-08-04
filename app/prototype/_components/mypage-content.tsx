"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import IconArticleLine from "@karrotmarket/react-monochrome-icon/IconArticleLine";
import IconStoreLine from "@karrotmarket/react-monochrome-icon/IconStoreLine";
import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";
import { useMyReports } from "../_lib/reports-store";
import { useFavoriteStores } from "../_lib/favorite-stores-store";
import { useCurrentDistrict } from "../_lib/location";
import { useOnboarding } from "../_lib/onboarding-store";
import { ProfileAvatar } from "./profile-avatar";
import { WeeklyCalendar } from "./weekly-calendar";

// F05 마이페이지 본문 — 허브형.
//
// 2026-08-04 정리로 금액·성과 지표를 전부 걷어냈다: 뱃지, 총 지출, 구매 N건,
// "가장 잘 산 건 …", 누적/이번 주 아낀 금액. 구매 인증 개념을 버리고 제보로 가기로 하면서
// 구매 데이터에 기대던 지표들이 근거를 잃었고, 남길수록 "얼마 벌었나"를 묻는 화면이 됐다.
// 그 자리를 주간 캘린더(제보 스탬프)가 대신한다 — 금액이 아니라 참여의 흔적.
//
// 찜한 야채 목록은 GNB 「찜」 탭으로 올라갔고(2단 깊이에 묻혀 있었다), 「내 정보」는 상단
// 프로필을 눌러 들어간다 — 리스트에 같은 진입점을 또 두지 않는다.
export function MyPageContent({ todayIso }: { todayIso: string }) {
  const { district, loading } = useCurrentDistrict();
  const { nickname, avatar } = useOnboarding();
  const myReports = useMyReports();
  const favoriteStores = useFavoriteStores();

  // 온보딩에서 설정한 닉네임 우선, 없으면 동네 이웃으로 폴백.
  const displayName = nickname || (loading ? "우리 동네 이웃" : `${district} 이웃`);

  return (
    <div className="flex flex-col gap-6 px-4 pt-1 pb-10">
      {/* 프로필 = 「내 정보」 진입점. 링크라 키보드 포커스·엔터가 그냥 따라온다. */}
      <Link
        href="/prototype/mypage/settings"
        className="flex items-center gap-3 rounded-2xl py-1 active:bg-gray-100"
      >
        <ProfileAvatar avatarId={avatar} size={64} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-title-18-bold text-content-primary">{displayName}</p>
          <p className="text-body-14-regular text-content-secondary">
            {loading ? "위치 확인 중…" : district}
          </p>
        </div>
        <span className="shrink-0 text-content-secondary [&_svg]:size-5" aria-hidden="true">
          <IconChevronRightLine />
        </span>
      </Link>

      <WeeklyCalendar todayIso={todayIso} />

      <nav aria-label="마이페이지 메뉴" className="flex flex-col">
        <MenuRow
          href="/prototype/mypage/reports"
          icon={<IconArticleLine />}
          label="내 제보"
          value={`${myReports.length}건`}
        />
        <MenuRow
          href="/prototype/mypage/stores"
          icon={<IconStoreLine />}
          label="찜한 가게"
          value={favoriteStores.length === 0 ? "없음" : `${favoriteStores.length}곳`}
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
      className="flex h-14 items-center gap-3 border-b border-border-secondary text-left last:border-b-0 active:bg-gray-100"
    >
      <span
        className="flex size-6 items-center justify-center text-content-secondary [&_svg]:size-5"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="flex-1 text-body-16-regular text-content-primary">{label}</span>
      <span className="text-body-14-regular text-content-secondary">{value}</span>
      <span className="text-content-secondary [&_svg]:size-4" aria-hidden="true">
        <IconChevronRightLine />
      </span>
    </Link>
  );
}
