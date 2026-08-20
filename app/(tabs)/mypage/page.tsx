import type { Metadata } from "next";
import Link from "next/link";
import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getItemsWithTemporaryFallback } from "@/app/_lib/api/server/items-fallback";
import { getSelectedRegionId } from "@/app/_lib/api/server/selected-region";
import { getFavoriteStoresWithTemporaryFallback } from "@/app/_lib/api/server/stores-fallback";
import { getMe } from "@/app/_lib/api/server/users";
import { ROUTES } from "@/app/_lib/routes";
import { LogoutButton } from "./_components/logout-button";
import { MyPageMenuRow } from "./_components/mypage-menu-row";
import { NicknameEditor } from "./_components/nickname-editor";

// F05 마이페이지 — **Figma 시안이 아직 없다**(`shared/pages.md` §시안 없음).
//
// 시안을 기다리는 대신 **Swagger에 실제로 있는 것만으로** 화면을 만들었다(2026-08-20 사용자
// 확정). 그래서 기획서(`농산물-문서/마이페이지/F05.md`)의 항목 중 계약이 없는 둘은 **넣지
// 않았다** — 더미로 채우지 않는다:
//   · 「이번 주 제보」 주간 캘린더 — 사용자별 제보 일자를 주는 엔드포인트가 없다
//   · 「내 제보」 목록 N건       — 내 제보 조회/수정/삭제 API가 없다 (POST만 있다)
// 두 항목은 BE 계약이 생기는 시점에 추가한다.
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
    countOrNull(async () => {
      const { stores: page } = await getFavoriteStoresWithTemporaryFallback({ token, page: 0, size: 1 });
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

      <LogoutButton />
    </div>
  );
}
