import Link from "next/link";
import { CardRecommendedStore } from "../../_components/card-recommended-store";
import { ImageGrass } from "../../_components/image-grass";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "@/app/_lib/routes";
import type { HomeRecommendedStore } from "./_data";
import { HomeVegetableImage } from "./home-vegetable-image";
import { SectionEmpty } from "./section-empty";

// F01 홈 1번 섹션 「오늘은 이 가게가 저렴해요」 — Figma 298:3485 / 298:3512.
//
// Figma 실측:
//   섹션      flex-col gap-[16px] w-[358px] (루트에 absolute left-16 top-132)
//   제목      title/20-bold · content/primary   ← ⚠️ 아래 "제목 타이포" 참고
//   본문      card/recommended-store 인스턴스 1장
//
// 섹션 제목 gap은 Figma 원본 그대로 16(gap-4)이다(실측 429:16742 = flex-col gap-[16px]).
// 세 섹션의 gap은 16 / 12 / 24로 서로 다르며, 2026-08-20 "Figma 원본 그대로" 지시에 따라
// 통일하지 않고 각 섹션이 자기 값을 쓴다.
//
// 섹션 제목 타이포는 **Figma 원본대로 title/20-bold**다(나머지 두 섹션은 title/18-bold).
// 한때 다수를 따라 18로 통일했었는데, UI QA(2026-08-20 #8 "글씨 크기 20으로 조정")에서
// 디자이너가 첫 섹션을 크게 두려는 의도였음을 확인해 원본으로 되돌렸다.
//
// ✅ 카드 배경(그라데이션)은 이제 연결돼 있다. Figma 원본 `#f7fff3 → #e8fbd5 → #dbfbb9`는 여전히
//    어느 Variable에도 바인딩돼 있지 않지만, 색을 추측해 토큰에 끼워 넣는 대신 **원본 fill을 그대로
//    SVG로 export**해서(`images/recommended-store-background.svg`) `@utility bg-recommended-store`로
//    걸었다. 그 유틸은 `CardRecommendedStore`가 자기 루트에 이미 붙이고 있으므로
//    (`bg-recommended-store … bg-cover`) 호출부에서 배경 className을 **또** 줄 필요가 없다 —
//    두 번 겹치면 같은 이미지를 두 겹으로 그리게 된다. `/playground` card-recommended-store 스토리도
//    같은 이유로 배경을 넘기지 않는다.
//    ⚠️ 대비: 배경이 흰색이 아니게 되면서 카드 안 텍스트 대비가 낮아진다(컴포넌트 주석에 실측이
//       적혀 있다 — 거리 4.23:1 · 요약 강조 2.95:1 · 야채 이름 4.23:1로 4.5:1 미달).
//       Figma 원본 그라데이션이라 여기서 색을 바꾸지 않고 사실만 기록한다(figma-bridge §4).
//
// 카드 전체를 가게 상세 링크로 감싼다 — Figma 개발 주석의 "해당 카드 클릭시 F03_가게상세
// 페이지로 이동"을 반영한 동작이다.

/**
 * 카드에 늘어놓는 야채 최대 개수. Figma 개발 주석(298:3515 안 row/store-vegetables):
 * "야채목록(컴포넌트 : vegetable_item_48)은 최대 5개 까지만 보여주고, 그 이후는 모어 뱃지에 표시".
 */
const MAX_VEGETABLES = 5;

/**
 * 야채 그림(48×48). 품목별 SVG를 우선 사용하고, 아직 SVG가 없는 품목은
 * 해당 품목의 로컬 이미지로 표시한다.
 */
export interface SectionRecommendedStoreProps {
  store: HomeRecommendedStore | null;
}

export function SectionRecommendedStore({ store }: SectionRecommendedStoreProps) {
  return (
    <section className="flex w-full flex-col items-start gap-4">
      <h2 className="w-full text-title-20-bold text-content-primary">오늘은 이 가게가 저렴해요</h2>

      {store ? (
        <Link
          href={ROUTES.storeDetail(store.storeId)}
          aria-label={`${store.name} 가게 상세 보기`}
          className="block w-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
        >
          <CardRecommendedStore
            storeIcon={<FigmaIcon name="store-fill-recommended-20" width={20} />}
            name={store.name}
            distance={store.distance}
            summaryLabel={store.summaryLabel}
            summaryValue={store.summaryValue}
            trailingIcon={<FigmaIcon name="chevron-right-recommended-20" width={20} />}
            vegetables={store.vegetables.slice(0, MAX_VEGETABLES).map((name) => ({
              name,
              visual: <HomeVegetableImage name={name} size={48} />,
            }))}
            moreCount={store.moreCount}
            // 화면GUI(원본) 364:6810 재실측(2026-08-13): 카드 안 `image/grass`는 **h-30**이고
            // grass-left 81×30 · grass-right 80×30 · gap 192 — 즉 `ImageGrass`의 기본값(Figma 원본)
            // 그대로다. 이전 `height={48}`(1.6배 확대)은 Figma에 근거가 없는 코드 판단이었다.
            grass={<ImageGrass />}
          />
        </Link>
      ) : (
        <SectionEmpty
          title="아직 추천할 가게가 없어요"
          description="이웃 제보가 모이면 오늘 가장 저렴한 가게를 알려드려요."
        />
      )}
    </section>
  );
}
