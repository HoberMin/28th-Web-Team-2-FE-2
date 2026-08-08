import { CardRecommendedStore } from "../../_components/card-recommended-store";
import { ImageGrass } from "../../_components/image-grass";
import { ImageVegetableOnion } from "../../_components/image-vegetable-onion";
import type { HomeRecommendedStore } from "./_data";
import { AssetSlot } from "./_slots";
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
// ⛔ 카드 배경(그라데이션)은 넣지 않았다. Figma 원본 `#f7fff3 → #e8fbd5 → #dbfbb9`가 어느
//    Variable에도 바인딩돼 있지 않고 우리 팔레트에도 없는 색이다. 추측 매핑도 raw hex 삽입도
//    금지(figma-bridge §3)라 `CardRecommendedStore`에 className을 주지 않고 **배경 없이** 렌더한다.
//    (컴포넌트 자신의 주석에도 같은 내용이 남아 있다.) 디자이너가 Variable로 등록하거나
//    기존 토큰 대체를 승인해야 풀린다.
//
// ⚠️ 카드 자체에 이동 정의가 없다 — row/recommended-store의 chevron이 이동을 암시하지만 Figma에
//    링크·버튼 정의가 없어 <a>/<button>으로 감싸지 않았다(임의 상호작용 추가 금지).

/**
 * 카드에 늘어놓는 야채 최대 개수. Figma 개발 주석(298:3515 안 row/store-vegetables):
 * "야채목록(컴포넌트 : vegetable_item_48)은 최대 5개 까지만 보여주고, 그 이후는 모어 뱃지에 표시".
 */
const MAX_VEGETABLES = 5;

export interface SectionRecommendedStoreProps {
  store: HomeRecommendedStore | null;
}

export function SectionRecommendedStore({ store }: SectionRecommendedStoreProps) {
  return (
    <section className="flex w-full flex-col items-start gap-4">
      <h2 className="w-full text-title-18-bold text-content-primary">오늘은 이 가게가 저렴해요</h2>

      {store ? (
        <CardRecommendedStore
          storeIcon={<AssetSlot className="size-5" />}
          name={store.name}
          distance={store.distance}
          summaryLabel={store.summaryLabel}
          summaryValue={store.summaryValue}
          trailingIcon={<AssetSlot className="size-5" />}
          vegetables={store.vegetables.slice(0, MAX_VEGETABLES).map((name) => ({
            name,
            visual: (
              <ImageVegetableOnion>
                <AssetSlot className="size-12" />
              </ImageVegetableOnion>
            ),
          }))}
          moreCount={store.moreCount}
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
