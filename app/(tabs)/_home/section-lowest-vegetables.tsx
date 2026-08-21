import { ListLowestVegetable } from "../../_components/list-lowest-vegetable";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import {
  formatTrendAmount,
  formatTrendPercent,
  type HomeLowestVegetable,
  type HomeTrendDirection,
} from "./_data";
import { HomeVegetableImage } from "./home-vegetable-image";
import { LowestVegetableList } from "./lowest-vegetable-list";
import { SectionEmpty } from "./section-empty";

// F01 홈 2번 섹션 「우리 동네 최저가 야채」 — Figma 298:3489 / 298:3516.
//
// Figma 실측:
//   섹션 헤더  flex items-center justify-between
//     제목     title/18-bold · content/primary · w-[160px]
//     보조문구 caption/12-medium · content/secondary · text-right · w-[112px]
//   본문       list/lowest-vegetable × 5(홈) 또는 10(더보기) + button/base
//   행의 판매 장소 표시는 `icon/map-pin-fill` 16px을 사용한다(가게 카드의 store-fill과 구분).
//
// Figma와 다르게 구현한 것:
//   · 제목 `w-[160px]`·보조문구 `w-[112px]` 고정 폭을 **버렸다.** 한국어 텍스트에 고정 폭을 주면
//     실데이터에서 반드시 깨진다. hug + justify-between으로 두고 제목만 말줄임한다.
//   · 섹션 제목↔본문 gap은 **Figma 원본 12(gap-3)** 다. 한때 세 섹션을 16으로 통일했었는데
//     2026-08-20 "Figma 원본 그대로" 지시로 되돌렸다(실측 429:16746 = flex-col gap-[12px]).
//
// 섹션 헤더(제목 + 우측 보조문구) 패턴은 화면 안에서 3번 반복되지만 **공통 컴포넌트로 묶지 않았다** —
// 세 곳의 타이포·정렬·존재 여부가 전부 달라서 지금 공통화하면 어느 값이 정본인지를 임의로 정하게 된다.
// 디자이너가 셋을 정렬해 주면 그때 승격한다.
//
// 대비: 제목 content/primary 13.51:1 · 보조문구 content/secondary 4.79:1 → 둘 다 통과.

const LIST_ID = "home-lowest-vegetables";

/** 방향 → Figma 아이콘 파일 이름(`icon/trend-*` 477-9119·9120·9121). */
const TREND_ICON: Record<HomeTrendDirection, string> = {
  down: "trend-down",
  up: "trend-up",
  flat: "trend-flat",
};

/**
 * 방향 → 화면에 안 보이는 대체 텍스트. 삼각형 모양과 색만으로 오름/내림을 알리면
 * WCAG 1.4.1(색 단독 의존)에 걸리고, 스크린리더에서는 방향 자체가 사라진다.
 *
 * ⚠️ 문구가 2026-08-20에 바뀌었다. 더미 시절엔 "지난주 대비"로 읽었는데, 실제 API
 * (`GET /regions/{regionId}/reports/lowest-prices`)가 주는 `priceDiffRate`는
 * **공공 시세 대비**다. 화살표의 의미가 다르므로 대체 텍스트도 그에 맞췄다.
 */
const TREND_LABEL: Record<HomeTrendDirection, string> = {
  down: "공공 시세보다 저렴",
  up: "공공 시세보다 비쌈",
  flat: "공공 시세와 같음",
};

/**
 * 등락 방향 아이콘 + 대체 텍스트(16×16 슬롯).
 *
 * `VegetableTrend`의 아이콘 슬롯은 aria-hidden이 아니라서 여기 넣은 `sr-only`가 그대로 읽힌다.
 * (`sr-only`는 화면에서 1px로 잘려 있어 16px 칸의 레이아웃을 건드리지 않는다.)
 */
function TrendIcon({ direction }: { direction: HomeTrendDirection }) {
  return (
    <>
      <FigmaIcon name={TREND_ICON[direction]} width={16} />
      <span className="sr-only">{TREND_LABEL[direction]}</span>
    </>
  );
}

/**
 * 야채 그림. 품목별 SVG를 우선 사용하고, 아직 SVG가 없는 품목은
 * 해당 품목의 로컬 이미지로 표시한다. **48×48** — 같은 화면 추천 가게 카드와 크기를
 * 맞춰 달라는 사용자 요청(2026-08-21)으로 Figma 원본(40×40) 대신 48을 쓴다.
 */
export interface SectionLowestVegetablesProps {
  items: HomeLowestVegetable[];
  collapsedCount: number;
}

export function SectionLowestVegetables({ items, collapsedCount }: SectionLowestVegetablesProps) {
  // 행은 서버에서 만들어 클라이언트 leaf에 넘긴다 — 목록 컴포넌트를 클라 번들에 넣지 않기 위함.
  //
  // 등락 색은 `trendState`로 방향을 따라간다. `ListLowestVegetable`에 `trendState`가 뚫려 있어
  // `VegetableTrend`의 `state` 축까지 그대로 통과한다(`GridVegetableItem`과 같은 처리).
  // 이걸 넘기지 않으면 `VegetableTrend`의 기본값이 "down"이라 오름·보합 행도 글자색만 파랑으로
  // 그려지고, flat 행은 값 텍스트가 숨겨지지 않아 "0원 (0.0%)"가 그대로 보인다.
  const rows = items.map((item, index) => (
    <ListLowestVegetable
      key={item.id}
      rank={index + 1}
      name={item.name}
      storeName={item.storeName}
      price={item.price}
      unit={item.unit}
      trendState={item.trend}
      trendAmount={formatTrendAmount(item)}
      trendPercent={formatTrendPercent(item)}
      visual={<HomeVegetableImage name={item.name} size={48} />}
      storeIcon={<FigmaIcon name="map-pin-fill" width={16} currentColor />}
      trendIcon={<TrendIcon direction={item.trend} />}
    />
  ));

  return (
    <section className="flex w-full flex-col items-start gap-3">
      <div className="flex w-full items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-title-18-bold text-content-primary">
          우리 동네 최저가 야채
        </h2>
        <p className="shrink-0 text-right text-caption-12-medium text-content-secondary">
          최근 7일간 · 이웃 제보
        </p>
      </div>

      {items.length > 0 ? (
        <LowestVegetableList rows={rows} collapsedCount={collapsedCount} listId={LIST_ID} />
      ) : (
        <SectionEmpty
          title="아직 우리 동네 제보가 없어요"
          description="이웃이 시세를 제보하면 최저가가 여기에 모여요."
        />
      )}
    </section>
  );
}
