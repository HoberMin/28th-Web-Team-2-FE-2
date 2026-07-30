import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { GNB } from "../_components/gnb";
import { BasketContent } from "../_components/basket-content";
import { getPriceMap } from "../_lib/home-data";

export const revalidate = 3600;

// F07 장바구니 — GNB 탭 루트. "장보기 전 예산 계획" 컨셉 — 품목+수량만 담아
// 공공 시세 기준 예상 총액 vs 동네 제보가 기준 예상 총액을 비교하고, 장보기 코스까지 제안한다.
// 비교 기준(시세)은 서버에서 내려준다 — 담은 품목은 localStorage(클라)에 있다.
export default async function BasketPage() {
  const priceMap = await getPriceMap();
  return (
    <PhoneFrame>
      <AppBar title="장바구니" />
      <Scroll>
        <BasketContent priceMap={priceMap} />
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
