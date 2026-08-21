import type { Metadata } from "next";
import Link from "next/link";
import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getItemsWithTemporaryFallback } from "@/app/_lib/api/server/items-fallback";
import { getSelectedRegionId } from "@/app/_lib/api/server/selected-region";
import { getFavoriteStores } from "@/app/_lib/api/server/stores";
import { getMyReports, getMyWeeklyReports } from "@/app/_lib/api/server/my-reports";
import { getMe } from "@/app/_lib/api/server/users";
import { ROUTES } from "@/app/_lib/routes";
import { LogoutButton } from "./_components/logout-button";
import { MyPageMenuRow } from "./_components/mypage-menu-row";
import { MyReportList } from "./_components/my-report-list";
import { NicknameEditor } from "./_components/nickname-editor";
import { WeeklyReportStrip } from "./_components/weekly-report-strip";

// F05 마이페이지 — **Figma 시안이 아직 없다**(`shared/pages.md` §시안 없음).
//
// 시안을 기다리는 대신 **Swagger에 실제로 있는 것만으로** 화면을 만들었다(2026-08-20 사용자
// 확정). 계약이 없어 빼 뒀던 두 항목은 2026-08-21 BE 엔드포인트가 생겨 붙였다:
//   · 「이번 주 제보」 → GET /api/v1/users/me/reports/weekly
//   · 「내 제보」      → GET /api/v1/users/me/reports (+ DELETE)
// 시안은 여전히 없어서 두 섹션 다 **기존 컴포넌트를 재사용**한다
// (`row/recent-report`·`list/recent-report`·`badge/report-date` 토큰 조합).
// 수정(PATCH)은 값 입력 폼이 필요해 아직 화면이 없다 — API 레이어만 준비돼 있다.
//
// 쓰는 API는 셋 다 개인화라 전부 no-store다:
//   GET /api/v1/users/me                 → 닉네임 · 현재 동네
//   GET /api/v1/users/me/favorite-stores → 단골 가게 수
//   GET /api/v1/items?favoriteOnly=true  → 찜한 야채 수
//
// 여백·타이포는 규격이 아니라 기존 컴포넌트에서 빌려온 값이다(`_components/mypage-menu-row`).
// GNB는 `app/(tabs)/layout.tsx`가 단독으로 그린다.

export const metadata: Metadata = {
  title: "내 정보 | 장보고",
};

/**
 * 개수 조회는 실패해도 화면을 세우지 않는다 — 프로필은 이미 떠 있는데 카운트 하나 때문에
 * 전체가 에러 화면이 되면 손해가 크다. 못 세면 자리를 "-"로 둔다(0으로 속이지 않는다).
 */
async function countOrNull(load: () => Promise<number>): Promise<number | null> {
  try {
    return await load();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    console.error("마이페이지 개수 조회 실패", { kind: error.kind, status: error.status });
    return null;
  }
}

function countLabel(count: number | null, unit: string, emptyLabel: string): string {
  if (count === null) return "-";
  if (count === 0) return emptyLabel;
  return `${count}${unit}`;
}

export default async function MyPage() {
  const token = await getAccessToken();

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-20 text-center">
        <p className="text-title-18-bold text-content-primary">로그인이 필요해요</p>
        <p className="text-body-14-regular text-content-secondary">
          카카오 로그인 후 내 정보와 단골 가게를 볼 수 있어요.
        </p>
        <Link
          href={ROUTES.onboarding}
          className="mt-2 inline-flex min-h-11 items-center px-2 text-body-16-semibold text-content-brand-medium underline"
        >
          로그인하러 가기
        </Link>
      </div>
    );
  }

  const regionId = await getSelectedRegionId();
  const [me, storeCount, vegetableCount] = await Promise.all([
    // 프로필 조회가 실패해도 화면은 세운다 — 닉네임 자리를 폴백 문구로 두는 편이 낫다.
    getMe(token).catch((error: unknown) => {
      if (!(error instanceof ApiError)) throw error;
      console.error("마이페이지 프로필 조회 실패", { kind: error.kind, status: error.status });
      return null;
    }),
    // ⚠️ `*WithTemporaryFallback`을 쓰지 않는다 — 단골 0개·찜 0개는 이 사용자에게 실제로
    // 유효한 상태인데, 그 래퍼는 빈 응답을 "DB에 실데이터가 없다"로 보고 더미로 채워서
    // 아무것도 안 찜한 사용자에게도 "단골 가게 3개"·"찜한 야채 46개"가 보였다
    // (`(tabs)/saved/page.tsx`와 같은 버그, 2026-08-21 리포트로 발견).
    countOrNull(async () => {
      const page = await getFavoriteStores({ token, page: 0, size: 1 });
      return page.totalElements ?? page.stores.length;
    }),
    // 찜한 야채는 지역 시세와 함께 오는 목록이라 동네가 정해져 있어야 조회된다.
    regionId
      ? countOrNull(async () => {
          const { page } = await getItemsWithTemporaryFallback({
            regionId,
            page: 0,
            size: 100,
            sort: "NAME_ASC",
            favoriteOnly: true,
            token,
          });
          return page.items.length;
        })
      : Promise.resolve(null),
  ]);

  // 제보 섹션은 실패해도 화면을 세우지 않는다 — 위 프로필·메뉴는 이미 떠 있다.
  // 카운트와 같은 방침(`countOrNull`)이고, 못 불러오면 그 섹션만 통째로 빠진다.
  const [weekly, myReports] = await Promise.all([
    getMyWeeklyReports(token).catch((error: unknown) => {
      if (!(error instanceof ApiError)) throw error;
      console.error("주간 제보 조회 실패", { kind: error.kind, status: error.status });
      return null;
    }),
    getMyReports({ token, page: 0, size: 20 }).catch((error: unknown) => {
      if (!(error instanceof ApiError)) throw error;
      console.error("내 제보 조회 실패", { kind: error.kind, status: error.status });
      return null;
    }),
  ]);
  // 오늘/어제 배지 기준일을 서버에서 한 번 고정한다 — 행마다 다른 "오늘"이 나오지 않게.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col px-4 pt-4 pb-20">
      <NicknameEditor
        nickname={me?.nickname ?? ""}
        regionName={me?.currentRegion?.regionName ?? undefined}
      />

      <nav aria-label="내 정보 메뉴" className="flex flex-col pt-2">
        <MyPageMenuRow
          href={ROUTES.mypageRegions}
          label="내 동네 관리"
          value={me?.currentRegion?.regionName ?? "-"}
        />
        <MyPageMenuRow
          href={`${ROUTES.saved}?tab=store`}
          label="단골 가게"
          value={countLabel(storeCount, "곳", "없음")}
        />
        <MyPageMenuRow
          href={`${ROUTES.saved}?tab=vegetable`}
          label="찜한 야채"
          value={countLabel(vegetableCount, "개", "없음")}
        />
      </nav>

      {weekly ? (
        <WeeklyReportStrip
          totalReportedDays={weekly.totalReportedDays}
          dailyReports={weekly.dailyReports}
        />
      ) : null}

      {myReports ? (
        <section aria-labelledby="my-reports-heading" className="pt-6">
          <div className="flex items-baseline justify-between">
            <h2 id="my-reports-heading" className="text-body-16-semibold text-content-primary">
              내 제보
            </h2>
            <p className="text-body-14-medium text-content-secondary">
              {myReports.totalCount === 0 ? "없음" : `${myReports.totalCount}건`}
            </p>
          </div>
          {myReports.reports.length === 0 ? (
            <p className="pt-3 text-body-14-regular text-content-secondary">
              아직 올린 제보가 없어요. 동네 가격을 제보하면 여기에 쌓여요.
            </p>
          ) : (
            <div className="pt-2">
              <MyReportList reports={myReports.reports} today={today} />
            </div>
          )}
        </section>
      ) : null}

      <LogoutButton />
    </div>
  );
}
