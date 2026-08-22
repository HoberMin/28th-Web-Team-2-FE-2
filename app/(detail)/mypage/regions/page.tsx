import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getSelectedRegion } from "@/app/_lib/api/server/selected-region";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "@/app/_lib/routes";
import { ReportHeader } from "@/app/report/_components/report-header";
import { RegionReset } from "./_region-reset";

// F05 마이페이지 하위 "내 동네 관리" — **Figma 시안이 없다**(마이페이지 자체가 아직 시안 없이
// Swagger 기반으로 만들어졌다, `(tabs)/mypage/page.tsx` 참고).
//
// 2026-08-22 전환: 동네를 여러 개 등록해 전환하던 화면을 **현재 위치 기반 하나**로 정리했다
// (사용자 결정). 목록·검색 추가·전환 UI를 없애고, 지금 보고 있는 동네와 "현재 위치로 다시
// 설정" 하나만 남긴다. 온보딩 지역 단계도 같은 흐름(탐색 → 확인/아니요)이다.
//
// 표시하는 동네는 Spring의 관심 지역 목록이 아니라 **홈·시세·가게가 실제로 읽는 선택 지역
// 쿠키**(`mg_region_*`)다 — 사용자가 화면에서 보고 있는 동네와 같은 값이어야 하기 때문이다.
//
// GNB는 렌더하지 않는다 — `(tabs)` 그룹 바깥의 풀스크린이다(`routes.ts` 주석과 같은 패턴).

export const metadata: Metadata = {
  title: "내 동네 관리 | 장보고",
};

function BackButton() {
  return (
    <Link
      href={ROUTES.mypage}
      aria-label="마이페이지로 돌아가기"
      className="flex size-12 items-center justify-center text-content-primary"
    >
      <FigmaIcon name="chevron-left" width={24} />
    </Link>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-surface-secondary">
      <div className="flex min-h-dvh w-full max-w-97.5 flex-col bg-surface-primary">
        <ReportHeader title="내 동네 관리" leading={<BackButton />} />
        {children}
      </div>
    </div>
  );
}

export default async function MyPageRegionsPage() {
  const token = await getAccessToken();

  if (!token) {
    return (
      <PageShell>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-title-18-bold text-content-primary">로그인이 필요해요</p>
          <p className="text-body-14-regular text-content-secondary">
            카카오 로그인 후 현재 위치로 동네를 설정할 수 있어요.
          </p>
          <Link
            href={ROUTES.onboarding}
            className="mt-2 inline-flex min-h-11 items-center px-2 text-body-16-semibold text-content-brand-medium underline"
          >
            로그인하러 가기
          </Link>
        </div>
      </PageShell>
    );
  }

  const selected = await getSelectedRegion();

  return (
    <PageShell>
      <main className="flex flex-1 flex-col px-4 pb-10">
        <section aria-label="현재 동네" className="pt-4">
          <h2 className="text-body-14-medium text-content-secondary">현재 동네</h2>
          <p className="pt-1 text-title-18-bold text-content-primary">
            {selected?.regionName ?? "아직 설정된 동네가 없어요"}
          </p>
          <p className="pt-2 text-body-14-regular text-content-secondary">
            동네는 현재 위치로만 정해져요. 이사했거나 다른 동네에서 보고 싶으면 그곳에서 다시
            설정해 주세요.
          </p>
          <RegionReset />
        </section>
      </main>
    </PageShell>
  );
}
