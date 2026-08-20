import type { Metadata } from "next";
import Link from "next/link";
import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import type { UserRegion } from "@/app/_lib/api/schemas/regions";
import { getUserRegions } from "@/app/_lib/api/server/regions";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "@/app/_lib/routes";
import { ReportHeader } from "@/app/report/_components/report-header";
import { RegionAdd } from "./_region-add";
import { RegionList } from "./_region-list";

// F05 마이페이지 하위 "내 동네 관리" — **Figma 시안이 없다**(마이페이지 자체가 아직 시안
// 없이 Swagger 기반으로 만들어졌다, `(tabs)/mypage/page.tsx` 참고). `User Region` 태그의
// 조회·추가·전환 3개 엔드포인트만으로 화면을 만들었다. **삭제 API가 없어 삭제 UI는 만들지
// 않는다** — 사용자 확정 사항.
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

export default async function MyPageRegionsPage() {
  const token = await getAccessToken();

  if (!token) {
    return (
      <div className="flex min-h-dvh justify-center bg-surface-secondary">
        <div className="flex min-h-dvh w-full max-w-97.5 flex-col bg-surface-primary">
          <ReportHeader title="내 동네 관리" leading={<BackButton />} />
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
            <p className="text-title-18-bold text-content-primary">로그인이 필요해요</p>
            <p className="text-body-14-regular text-content-secondary">
              카카오 로그인 후 동네를 등록하고 전환할 수 있어요.
            </p>
            <Link
              href={ROUTES.onboarding}
              className="mt-2 inline-flex min-h-11 items-center px-2 text-body-16-semibold text-content-brand-medium underline"
            >
              로그인하러 가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let regions: UserRegion[];
  let loadFailed = false;
  try {
    regions = await getUserRegions(token);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    console.error("내 동네 목록 조회 실패", { kind: error.kind, status: error.status });
    regions = [];
    loadFailed = true;
  }

  return (
    <div className="flex min-h-dvh justify-center bg-surface-secondary">
      <div className="flex min-h-dvh w-full max-w-97.5 flex-col bg-surface-primary">
        <ReportHeader title="내 동네 관리" leading={<BackButton />} />

        <main className="flex flex-1 flex-col px-4 pb-10">
          <section aria-label="등록된 동네" className="pt-2">
            {loadFailed ? (
              <p role="alert" className="px-2 py-8 text-center text-body-14-medium text-content-secondary">
                동네 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
              </p>
            ) : regions.length === 0 ? (
              <p className="px-2 py-8 text-center text-body-14-medium text-content-secondary">
                등록된 동네가 없어요.
              </p>
            ) : (
              <RegionList regions={regions} />
            )}
          </section>

          <section aria-label="동네 추가" className="pt-6">
            <h2 className="px-2 pb-2 text-body-14-medium text-content-secondary">동네 추가</h2>
            <RegionAdd />
          </section>
        </main>
      </div>
    </div>
  );
}
