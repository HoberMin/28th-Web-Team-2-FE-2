import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { GNB } from "../_components/gnb";
import { BasketContent } from "../_components/basket-content";

// F07 장바구니 — GNB 탭 루트. "장보기 전 예산 계획" 컨셉(사용자 확정, 2026-07-30) — 제보를 묶지 않고
// 품목+수량만 담아 KAMIS 기준 예상 총액 vs 동네 최저 제보가 기준 예상 총액을 비교한다.
export default function BasketPage() {
  return (
    <PhoneFrame>
      <AppBar title="장바구니" />
      <Scroll>
        <BasketContent />
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
