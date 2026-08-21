import { TabBar } from "../../_components/tab-bar";
import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getItems } from "@/app/_lib/api/server/items";
import { getSelectedRegionId } from "@/app/_lib/api/server/selected-region";
import { getFavoriteStoresWithTemporaryFallback } from "@/app/_lib/api/server/stores-fallback";
import { ROUTES } from "../../_lib/routes";
import { mapItemToPriceView } from "../prices/_item-view";
import { SavedEmpty } from "./_components/saved-empty";
import { SavedStoreList } from "./_components/saved-store-list";
import { SavedVegetableList } from "./_components/saved-vegetable-list";
import { parseSavedTab } from "./_data";
import { mapFavoriteStoreToView } from "./_saved-store-view";

// F04 찜 — Figma `화면GUI` 298-3576(찜_야채) · 298-3594(찜_가게), sync 2026-08-08.
//
// 탭 전환은 **URL 쿼리**다(`/saved?tab=vegetable` | `?tab=store`). searchParams를 읽는 Server
// Component + 링크 2개라 `"use client"`가 필요 없고, 선택된 탭의 목록만 서버에서 준비한다.
//
// GNB는 이 화면이 그리지 않는다 — `app/(tabs)/layout.tsx`가 단독으로 렌더하고 본문만 스크롤한다.
//
// 두 탭 모두 RSC에서 조회한다 — 야채는 `GET /api/v1/items?favoriteOnly=true`, 가게는
// `GET /api/v1/users/me/favorite-stores`. 응답이 전부 개인화라 no-store다.
//
// 가게 탭의 하트는 **단골 해제 버튼**이라 목록만 클라이언트 컴포넌트다(`_components/saved-store-list`).
//
// ── Figma와 의도적으로 다르게 구현한 것 ──────────────────────────────────────
//
// ① GNB 회피 여백: Figma는 콘텐츠 하단에 GNB(79px) 몫의 여백이 없어 야채 그리드 3행째 텍스트가
//    GNB에 잘린다(가게 탭도 7행째부터 같은 문제가 잠복). 스크롤 콘텐츠 하단에 pb-20(80px)을 준다.
//
// ② 탭 아래 여백 통일: Figma는 야채 탭 40 / 가게 탭 24로 어긋나 있어 탭을 오갈 때 목록이 16px
//    점프한다. **24(gap-6)로 통일**했다 — 4의 배수이고 두 값 중 작은 쪽이라 첫 행이 더 일찍 보인다.
//
// ③ 상단 여백: Figma는 상태바(44) 아래 17px에서 탭이 시작한다. 상태바는 OS 몫이라 우리가 그리지
//    않고, 17은 4의 배수가 아니라 pt-4(16)로 맞췄다(1px 차이).
//
// ④ 고정 폭·소수점 제거: 358(=390−16×2)·111.33(=358−12×2 ÷3)·179(=358÷2)는 전부 Figma 고정폭
//    나눗셈의 부산물이라 px로 박지 않고 px-4 / grid-cols-3 gap-x-3 / flex-1로 옮겼다.
//
// ⑤ 하트 상태: Figma 가게 탭은 6행 중 5행이 빈 하트인데 찜 목록이므로 시안 실수로 보고
//    **전부 채워진 하트**로 구현했다.
//
// 에셋: 야채 사진·하트·등락 아이콘은 Figma MCP로 export한 `public/figma/design-library/`
// 원본을 그대로 쓴다. **가게 사진만 예외로 API의 `storeImageUrl`**이고, 없으면 회색 자리를 둔다.
//
// ⚠️ 남은 폭 이슈(보고 대상): 공통 컴포넌트 `GridVegetableItem`은 내부 사진·정보 폭이 110px로
//    고정이라(F02와 공유하는 파일이라 이번 작업에서 수정하지 않았다) 390px보다 넓은 화면에서는
//    3열 칸이 넓어져도 카드가 110px에 머무르고 칸 오른쪽에 여백이 남는다. 390 기준으로는 정확하다.

interface SavedPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SavedPage({ searchParams }: SavedPageProps) {
  const { tab } = await searchParams;
  const activeTab = parseSavedTab(tab);
  const tabs = [
    { href: `${ROUTES.saved}?tab=vegetable`, label: "야채" },
    { href: `${ROUTES.saved}?tab=store`, label: "가게" },
  ];

  return (
    // 화면GUI(원본) 364:6898·6922 실측(2026-08-13):
    //   상태바 bottom 44 → `tab/bar` 시작 61  ⇒ 위 여백 **17** (`pt-4.25`)
    //     (Figma 좌표가 44.0185 + 16.9814로 소수점이지만 합이 정확히 61이라 상쇄된다)
    //   `tab/bar` bottom 104 → 목록 시작 124  ⇒ 탭↔본문 **20** (`gap-5`)
    // ⚠️ 야채 탭만 그리드가 body 안에서 18.94px 더 내려가 있어 실제 시안은 탭 전환 때 19px 점프한다.
    //    코드는 **점프를 재현하지 않고 20으로 통일**했다 (GUI피드백.md에 기록).
    <div className="flex flex-col gap-5 px-4 pt-4.25 pb-20">
      <TabBar
        items={tabs}
        activeHref={activeTab === "store" ? tabs[1].href : tabs[0].href}
        ariaLabel="찜 목록 종류"
      />

      {activeTab === "vegetable" ? (
        <VegetableTab />
      ) : (
        <StoreTab />
      )}
    </div>
  );
}

async function VegetableTab() {
  const [token, regionId] = await Promise.all([getAccessToken(), getSelectedRegionId()]);

  if (!token) {
    return (
      <SavedEmpty
        title="로그인이 필요해요"
        description="카카오 로그인 후 찜한 야채를 모아볼 수 있어요."
      />
    );
  }

  if (!regionId) {
    return (
      <SavedEmpty
        title="동네 정보가 필요해요"
        description="온보딩에서 동네를 선택하면 찜한 야채의 시세를 볼 수 있어요."
      />
    );
  }

  // ⚠️ `*WithTemporaryFallback` 래퍼를 쓰지 않는다 — 그건 "빈 응답 = DB에 실데이터가 아직
  // 없다"로 보고 46종 더미로 채우는데, 여기서는 `favoriteOnly: true`라 빈 응답이 곧
  // "이 사용자가 찜한 야채가 없다"는 **정상 상태**다. 폴백을 쓰면 아무것도 안 찜한 사용자
  // 에게 찜 안 한 야채 46종이 그대로 보인다(2026-08-21 버그 리포트로 발견).
  const itemPage = await getItems({
    regionId,
    page: 0,
    size: 100,
    sort: "NAME_ASC",
    favoriteOnly: true,
    token,
  });

  return <SavedVegetableList vegetables={itemPage.items.map(mapItemToPriceView)} />;
}

async function StoreTab() {
  const token = await getAccessToken();

  if (!token) {
    return (
      <SavedEmpty
        title="로그인이 필요해요"
        description="카카오 로그인 후 단골 가게를 모아볼 수 있어요."
      />
    );
  }

  // 좌표를 넘기지 않는다 — 사용자 위치는 브라우저에만 있고, 서버에서 지어낼 값이 아니다.
  // 그래서 `distanceMeters`가 비고, 행의 거리 자리도 비운다(`mapFavoriteStoreToView`).
  let stores;
  try {
    const { stores: page } = await getFavoriteStoresWithTemporaryFallback({ token, page: 0, size: 50 });
    stores = page.stores.map(mapFavoriteStoreToView);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    console.error("단골 가게 조회 실패", { kind: error.kind, status: error.status });
    return (
      <SavedEmpty
        title="단골 가게를 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        actionHref={`${ROUTES.saved}?tab=store`}
        actionLabel="다시 불러오기"
      />
    );
  }

  if (stores.length === 0) {
    return (
      <SavedEmpty
        title="단골 가게가 없어요"
        description="가게 화면에서 하트를 누르면 여기에 모여요."
        actionHref={ROUTES.stores}
        actionLabel="동네 가게 보러 가기"
      />
    );
  }

  return <SavedStoreList stores={stores} />;
}
