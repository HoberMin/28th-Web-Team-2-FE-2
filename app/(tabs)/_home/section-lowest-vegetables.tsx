import { ListLowestVegetable } from "../../_components/list-lowest-vegetable";
import type { HomeLowestVegetable } from "./_data";
import { AssetSlot } from "./_slots";
import { LowestVegetableList } from "./lowest-vegetable-list";
import { SectionEmpty } from "./section-empty";

// F01 홈 2번 섹션 「우리 동네 최저가 야채」 — Figma 298:3489 / 298:3516.
//
// Figma 실측:
//   섹션 헤더  flex items-center justify-between
//     제목     title/18-bold · content/primary · w-[160px]
//     보조문구 caption/12-medium · content/secondary · text-right · w-[112px]
//   본문       list/lowest-vegetable × 5(홈) 또는 10(더보기) + button/base
//
// Figma와 다르게 구현한 것:
//   · 제목 `w-[160px]`·보조문구 `w-[112px]` 고정 폭을 **버렸다.** 한국어 텍스트에 고정 폭을 주면
//     실데이터에서 반드시 깨진다. hug + justify-between으로 두고 제목만 말줄임한다.
//   · 섹션 제목↔본문 gap을 12 → **16(gap-4)로 통일**했다(세 섹션이 16/12/24로 갈려 있었다 —
//     section-recommended-store.tsx 주석 참고).
//
// 섹션 헤더(제목 + 우측 보조문구) 패턴은 화면 안에서 3번 반복되지만 **공통 컴포넌트로 묶지 않았다** —
// 세 곳의 타이포·정렬·존재 여부가 전부 달라서 지금 공통화하면 어느 값이 정본인지를 임의로 정하게 된다.
// 디자이너가 셋을 정렬해 주면 그때 승격한다.
//
// 대비: 제목 content/primary 13.51:1 · 보조문구 content/secondary 4.79:1 → 둘 다 통과.

const LIST_ID = "home-lowest-vegetables";

export interface SectionLowestVegetablesProps {
  items: HomeLowestVegetable[];
  collapsedCount: number;
}

export function SectionLowestVegetables({ items, collapsedCount }: SectionLowestVegetablesProps) {
  // 행은 서버에서 만들어 클라이언트 leaf에 넘긴다 — 목록 컴포넌트를 클라 번들에 넣지 않기 위함.
  //
  // 야채 그림: Figma는 이 자리에 image/vegetable-onion(40px)을 꽂아 두지만 그 래퍼를 쓰지 않았다.
  // (a) ListLowestVegetable이 이미 size-10 + overflow-hidden 슬롯으로 감싸고 있어 래퍼가 할 일이 없고,
  // (b) ImageVegetableOnion 기본값이 48px이라 40px로 줄이려면 className으로 size를 덮어야 하는데
  //     app/_lib/cn.ts는 tailwind-merge가 없어서(그 파일 주석 참고) size-12와 size-10이 둘 다 남고
  //     결과가 CSS 선언 순서에 의존하게 된다. 그 경로를 피했다.
  const rows = items.map((item, index) => (
    <ListLowestVegetable
      key={item.id}
      rank={index + 1}
      name={item.name}
      storeName={item.storeName}
      price={item.price}
      unit={item.unit}
      trendAmount={item.trendAmount}
      trendPercent={item.trendPercent}
      visual={<AssetSlot className="size-10" />}
      storeIcon={<AssetSlot className="size-4" />}
      trendIcon={<AssetSlot className="size-4" />}
    />
  ));

  return (
    <section className="flex w-full flex-col items-start gap-4">
      <div className="flex w-full items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-title-18-bold text-content-primary">
          우리 동네 최저가 야채
        </h2>
        <p className="shrink-0 text-right text-caption-12-medium text-content-secondary">
          일주일 간 · 이웃 제보
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
