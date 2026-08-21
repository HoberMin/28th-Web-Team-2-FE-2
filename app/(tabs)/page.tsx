import { HOME_LOWEST_COLLAPSED_COUNT } from "./_home/_data";
import { mapRecommendedStoreToView, mapRegionLowestPriceToView } from "./_home/home-view";
import { HomeHeader } from "./_home/home-header";
import { loadHomeNewsItems } from "./_home/news";
import { SectionLowestVegetables } from "./_home/section-lowest-vegetables";
import { SectionNews } from "./_home/section-news";
import { SectionRecommendedStore } from "./_home/section-recommended-store";
import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getTemporaryNewsArticles } from "@/app/_lib/api/server/news-fallback";
import { getRegionLowestPrices } from "@/app/_lib/api/server/reports";
import { getMe } from "@/app/_lib/api/server/users";
import { getSelectedRegion } from "@/app/_lib/api/server/selected-region";
import { getRecommendedStores } from "@/app/_lib/api/server/stores";

// F01 홈 — Figma `화면GUI` 298:3477(F01_홈) · 298:3509(F01_홈_더보기).
//
// **Server Component다.** 클라이언트 지시어는 `_home/lowest-vegetable-list.tsx`(더보기 토글) 하나뿐이다.
//
// 두 Figma 프레임은 별개 화면이 아니라 **같은 화면의 접힘/펼침 상태**라 라우트를 나누지 않았다
// (차이는 목록 5행↔10행, 버튼 라벨 더보기↔닫기뿐).
//
// GNB는 여기서 렌더하지 않는다 — `app/(tabs)/layout.tsx`가 단독으로 소유하고 본문만 스크롤시킨다.
// Figma는 프레임마다 nav/gnb 인스턴스를 하나씩 들고 있지만 그건 캔버스 사정이다.
//
// ── Figma를 그대로 베끼지 않은 곳 (레이아웃) ─────────────────────────────────────
//  1. 루트가 Figma에서는 `relative size-full` + 자식 전부 `absolute top-[…]`다. 섹션 **내부**는
//     auto-layout이 정상이라 **루트만** flex-col로 바꿨다. 실측 섹션 간격이 두 프레임 모두 44px로
//     일관돼서(132→? ... 각 섹션 끝↔다음 섹션 시작) `gap-11` 하나로 대체된다.
//  2. 좌우 여백: F01_홈은 섹션이 center constraint, 더보기 프레임은 left 16으로 앵커가 갈려 있다.
//     둘 다 `px-4` 한 번으로 통일했다. 390px는 기준 뷰포트일 뿐 고정 폭이 아니다(conventions #3).
//  3. Status Bar(298:3478 · 298:3510)는 iOS 목업이라 구현 대상이 아니다. 그래서 Figma의 top 좌표
//     (헤더 64 · 첫 섹션 132)도 그대로 옮기지 않았다 — 헤더를 스크롤 영역 맨 위에 두고, 헤더와
//     첫 섹션 사이만 Figma 실측 20px(pt-5)을 지켰다.
//  4. `md:` 분기는 만들지 않았다 — 데스크탑 시안이 없다.
//
// ── 상태 3종 ──────────────────────────────────────────────────────────────────
//  · 빈 상태: 구현했다(각 섹션이 처리 — `_home/section-empty.tsx`). **Figma 시안 없는 임시 구현이다.**
//  · 추천 가게와 최저가는 실 API의 결과를 사용한다. 최근 시세 뉴스는 백엔드 API를 호출하지 않고
//    임시 뉴스만 표시한다.
//  · 위치 칩의 동네 이름도 상수가 아니라 선택 지역 쿠키에서 온다. 동네를 아직 안 골랐으면
//    최저가·추천 가게는 조회 자체가 불가능하므로(둘 다 regionId 필수) 빈 상태를 보여 준다.

/** 섹션 하나의 실패가 홈 전체를 세우지 않게 한다. 실패하면 그 섹션만 빈 상태로 떨어진다. */
async function sectionData<T>(label: string, load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    console.error(`홈 ${label} 조회 실패`, { kind: error.kind, status: error.status });
    return null;
  }
}

/** 로그인 사용자는 계정에 저장된 현재 동네를 홈의 기준으로 사용한다. */
async function getHomeRegion() {
  const [selectedRegion, token] = await Promise.all([getSelectedRegion(), getAccessToken()]);
  if (!token) return { region: selectedRegion, token };

  try {
    const me = await getMe(token);
    if (!me.currentRegion) return { region: selectedRegion, token };
    return { region: me.currentRegion, token };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    console.error("홈 현재 동네 조회 실패", { kind: error.kind, status: error.status });
    return { region: selectedRegion, token };
  }
}

export default async function HomePage() {
  const { region, token } = await getHomeRegion();

  const [newsItems, recommendation, lowestPrices] = await Promise.all([
    loadHomeNewsItems(async () => getTemporaryNewsArticles()),
    // ⚠️ `getRecommendedStoresWithTemporaryFallback`을 쓰지 않는다 — 그 더미의 storeId
    // (`storeIdForIndex` = 1,2,3…)가 라이브 실제 storeId와 겹친다. 카드는 더미 가게 이름을
    // 보여주지만 눌러서 `/stores/{storeId}`로 들어가면 그 id의 **진짜 다른 가게**가 뜬다 —
    // `/stores` 지도 목록에서 발견한 것과 똑같은 버그다(2026-08-21). 진짜 빈 결과는
    // `SectionRecommendedStore`의 "아직 추천할 가게가 없어요" 빈 상태가 처리한다.
    region
      ? sectionData("추천 가게", () => getRecommendedStores({ regionId: region.regionId, token }))
      : Promise.resolve(null),
    region
      ? sectionData("동네 최저가", async () => {
          const { prices } = await getRegionLowestPrices({
            regionId: region.regionId,
            limit: 10,
          });
          return prices;
        })
      : Promise.resolve(null),
  ]);

  const recommendedStore = recommendation?.stores[0]
    ? mapRecommendedStoreToView(recommendation.stores[0])
    : null;
  const lowestVegetables = (lowestPrices?.items ?? []).map(mapRegionLowestPriceToView);

  return (
    // pb-10: 스크롤 끝 여백. (tabs) 레이아웃의 GNB는 본문 위를 덮지 않고 옆에 붙지만,
    // 마지막 카드가 GNB 경계선에 딱 붙어 끝나지 않도록 확보한다.
    // UI QA 2026-08-20 #4 "하단 여백 반 정도 줄여주세요" → pb-20(80px)에서 절반으로.
    <div className="flex flex-col pb-10">
      <HomeHeader region={region?.regionName ?? "동네 선택"} />

      <div className="flex flex-col gap-11 px-4 pt-5">
        <SectionRecommendedStore store={recommendedStore} />
        <SectionLowestVegetables
          items={lowestVegetables}
          collapsedCount={HOME_LOWEST_COLLAPSED_COUNT}
        />
        <SectionNews items={newsItems} />
      </div>
    </div>
  );
}
