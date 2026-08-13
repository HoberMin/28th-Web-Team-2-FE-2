import { CardRecommendedStore } from "../../_components/card-recommended-store";
import { ImageGrass } from "../../_components/image-grass";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import type { HomeRecommendedStore } from "./_data";
import { SectionEmpty } from "./section-empty";

// F01 홈 1번 섹션 「오늘은 이 가게가 저렴해요」 — Figma 298:3485 / 298:3512.
//
// Figma 실측:
//   섹션      flex-col gap-[16px] w-[358px] (루트에 absolute left-16 top-132)
//   제목      title/20-bold · content/primary   ← ⚠️ 아래 "제목 타이포" 참고
//   본문      card/recommended-store 인스턴스 1장
//
// 섹션 제목 gap을 gap-4(16px)로 통일했다 — 세 섹션이 각각 16 / 12 / 24로 갈려 있어 그대로 옮기면
// 같은 위계의 제목이 화면 안에서 세 가지 리듬을 갖는다. 가장 앞 섹션이 쓰는 16을 골랐고,
// 세 값(12·16·24)의 가운데이기도 하다. → 디자이너 확인 필요.
//
// 섹션 제목 타이포도 통일했다: Figma는 이 섹션만 title/20-bold이고 나머지 둘은 title/18-bold다.
// 다수(2/3)를 따라 **title/18-bold로 통일**했다. 첫 섹션을 크게 두려는 의도였다면 되돌려야 한다
// → 디자이너 확인 필요.
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
// ⚠️ 카드 자체에 이동 정의가 없다 — row/recommended-store의 chevron이 이동을 암시하지만 Figma에
//    링크·버튼 정의가 없어 <a>/<button>으로 감싸지 않았다(임의 상호작용 추가 금지).

/**
 * 카드에 늘어놓는 야채 최대 개수. Figma 개발 주석(298:3515 안 row/store-vegetables):
 * "야채목록(컴포넌트 : vegetable_item_48)은 최대 5개 까지만 보여주고, 그 이후는 모어 뱃지에 표시".
 */
const MAX_VEGETABLES = 5;

/**
 * 야채 그림(48×48). Figma 샘플 에셋이 양파 하나뿐이라 모든 항목이 같은 그림을 쓴다 —
 * 품목별 그림이 올라오면 여기서 이름 → 파일 매핑만 갈아 끼우면 된다.
 * `/playground` card-recommended-store 스토리와 같은 크기·같은 처리다.
 */
function VegetableImage() {
  return <FigmaImage name="onion.png" width={48} height={48} className="size-12 object-contain" />;
}

export interface SectionRecommendedStoreProps {
  store: HomeRecommendedStore | null;
}

export function SectionRecommendedStore({ store }: SectionRecommendedStoreProps) {
  return (
    <section className="flex w-full flex-col items-start gap-4">
      <h2 className="w-full text-title-18-bold text-content-primary">오늘은 이 가게가 저렴해요</h2>

      {store ? (
        <CardRecommendedStore
          storeIcon={<FigmaIcon name="store-fill-recommended-20" width={20} />}
          name={store.name}
          distance={store.distance}
          summaryLabel={store.summaryLabel}
          summaryValue={store.summaryValue}
          trailingIcon={<FigmaIcon name="chevron-right-recommended-20" width={20} />}
          vegetables={store.vegetables.slice(0, MAX_VEGETABLES).map((name) => ({
            name,
            visual: <VegetableImage />,
          }))}
          moreCount={store.moreCount}
          // 화면GUI(원본) 364:6810 재실측(2026-08-13): 카드 안 `image/grass`는 **h-30**이고
          // grass-left 81×30 · grass-right 80×30 · gap 192 — 즉 `ImageGrass`의 기본값(Figma 원본)
          // 그대로다. 이전 `height={48}`(1.6배 확대)은 Figma에 근거가 없는 코드 판단이었다.
          grass={<ImageGrass />}
        />
      ) : (
        <SectionEmpty
          title="아직 추천할 가게가 없어요"
          description="이웃 제보가 모이면 오늘 가장 저렴한 가게를 알려드려요."
        />
      )}
    </section>
  );
}
