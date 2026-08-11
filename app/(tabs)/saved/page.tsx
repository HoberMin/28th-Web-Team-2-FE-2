import Link from "next/link";
import type { ReactNode } from "react";
import { GridVegetableItem } from "../../_components/grid-vegetable-item";
import { TabBar } from "../../_components/tab-bar";
import type { VegetableTrendState } from "../../_components/vegetable-trend";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import { ROUTES } from "../../_lib/routes";
import { RowSavedStore } from "./_components/row-saved-store";
import { SavedEmpty } from "./_components/saved-empty";
import {
  SAVED_STORES,
  SAVED_VEGETABLES,
  type SavedStore,
  type SavedVegetable,
  parseSavedTab,
} from "./_data";

// F04 찜 — Figma `화면GUI` 298-3576(찜_야채) · 298-3594(찜_가게), sync 2026-08-08.
//
// 탭 전환은 **URL 쿼리**다(`/saved?tab=vegetable` | `?tab=store`). searchParams를 읽는 Server
// Component + 링크 2개라 `"use client"`가 필요 없고, 선택된 탭의 목록만 서버에서 준비한다.
//
// GNB는 이 화면이 그리지 않는다 — `app/(tabs)/layout.tsx`가 단독으로 렌더하고 본문만 스크롤한다.
//
// 데이터는 더미다(`_data.ts`) — 모듈 상수라 fetch가 없고, 따라서 선언할 캐싱 의도도 없다
// (conventions #11). searchParams를 읽으므로 이 라우트는 동적 렌더링이다. 실연결은 별도 사이클.
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
// 에셋: 야채 사진·가게 사진·하트·등락 아이콘은 Figma MCP로 export한
// `public/figma/design-library/` 원본을 그대로 쓴다.
//
// ⚠️ 남은 폭 이슈(보고 대상): 공통 컴포넌트 `GridVegetableItem`은 내부 사진·정보 폭이 110px로
//    고정이라(F02와 공유하는 파일이라 이번 작업에서 수정하지 않았다) 390px보다 넓은 화면에서는
//    3열 칸이 넓어져도 카드가 110px에 머무르고 칸 오른쪽에 여백이 남는다. 390 기준으로는 정확하다.

/** 야채 카드 사진(110×110). 품목명은 옆 텍스트가 담당하므로 장식 이미지로 둔다. */
function VegetablePhoto() {
  return (
    <FigmaImage
      name="vegetable-grid.png"
      width={110}
      height={110}
      className="size-full object-cover"
    />
  );
}

/** F04 가게 행 인스턴스(298-3598)의 image fill을 72×72로 MCP export한 원본. */
function StorePhoto() {
  return (
    <FigmaImage
      name="store-thumbnail.png"
      width={72}
      height={72}
      className="size-full object-cover"
    />
  );
}

/**
 * 등락 방향 아이콘. 원본 SVG가 방향별 색(trend/down·up·flat)을 이미 품고 있어 currentColor로
 * 바꾸지 않고 그대로 쓴다. 방향을 색에만 의존해 전달하지 않도록 sr-only 라벨을 함께 낸다
 * (WCAG 1.4.1).
 */
const TREND_ICON: Record<VegetableTrendState, ReactNode> = {
  down: <FigmaIcon name="trend-down" width={16} />,
  up: <FigmaIcon name="trend-up" width={16} />,
  flat: <FigmaIcon name="trend-flat" width={16} />,
};

const TREND_LABEL: Record<VegetableTrendState, string> = {
  down: "어제보다 내림",
  up: "어제보다 오름",
  flat: "어제와 같음",
};

interface SavedPageProps {
  searchParams: Promise<{ tab?: string; empty?: string }>;
}

export default async function SavedPage({ searchParams }: SavedPageProps) {
  const { tab, empty } = await searchParams;
  const activeTab = parseSavedTab(tab);

  // ⚠️ 임시(더미 데이터 기간 한정): 시안 없는 빈 상태를 배포된 화면에서 눈으로 확인할 수단이
  //    `?empty=1`밖에 없어 열어 뒀다. **삭제 조건은 코드 주석이 아니라 `shared/product-spec.md`의
  //    `TODO(✍️)` 항목이 들고 있다** — 주석은 사람이 안 읽으면 영영 남기 때문이다.
  const showEmpty = empty === "1";
  const vegetables = showEmpty ? [] : SAVED_VEGETABLES;
  const stores = showEmpty ? [] : SAVED_STORES;

  // `?empty=1`이 켜져 있으면 탭을 옮겨도 유지되게 한다(위 임시 분기와 함께 삭제될 코드).
  const emptyQuery = showEmpty ? "&empty=1" : "";
  const tabs = [
    { href: `${ROUTES.saved}?tab=vegetable${emptyQuery}`, label: "야채" },
    { href: `${ROUTES.saved}?tab=store${emptyQuery}`, label: "가게" },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 pt-4 pb-20">
      <TabBar
        items={tabs}
        activeHref={activeTab === "store" ? tabs[1].href : tabs[0].href}
        ariaLabel="찜 목록 종류"
      />

      {activeTab === "vegetable" ? (
        <VegetableTab vegetables={vegetables} />
      ) : (
        <StoreTab stores={stores} />
      )}
    </div>
  );
}

function VegetableTab({ vegetables }: { vegetables: SavedVegetable[] }) {
  if (vegetables.length === 0) {
    return (
      <SavedEmpty
        title="찜한 야채가 없어요"
        description="시세 화면에서 하트를 누르면 여기에 모여요."
        actionHref={ROUTES.prices}
        actionLabel="야채 시세 보러 가기"
      />
    );
  }

  return (
    <ul className="grid grid-cols-3 gap-x-3 gap-y-10">
      {vegetables.map((vegetable) => (
        <li key={vegetable.id}>
          <Link
            href={ROUTES.priceDetail(vegetable.id)}
            className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
          >
            <GridVegetableItem
              visual={<VegetablePhoto />}
              name={vegetable.name}
              price={vegetable.price}
              unit={vegetable.unit}
              trendAmount={vegetable.trendAmount}
              trendPercent={vegetable.trendPercent}
              trendState={vegetable.trendState}
              trendIcon={
                <>
                  {TREND_ICON[vegetable.trendState]}
                  <span className="sr-only">{TREND_LABEL[vegetable.trendState]}</span>
                </>
              }
              favorite
              favoriteIcon={<FigmaIcon name="heart-fill-grid-24" width={24} />}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function StoreTab({ stores }: { stores: SavedStore[] }) {
  if (stores.length === 0) {
    return (
      <SavedEmpty
        title="찜한 가게가 없어요"
        description="가게 화면에서 하트를 누르면 여기에 모여요."
        actionHref={ROUTES.stores}
        actionLabel="동네 가게 보러 가기"
      />
    );
  }

  return (
    <ul className="flex flex-col">
      {stores.map((store) => (
        <li key={store.id}>
          <Link
            href={ROUTES.storeDetail(store.id)}
            className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
          >
            <RowSavedStore
              thumbnail={<StorePhoto />}
              name={store.name}
              distance={store.distance}
              openState={store.openState}
              openLabel={store.openLabel}
              hours={store.hours}
              favoriteIcon={<FigmaIcon name="heart-fill" width={23} />}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
