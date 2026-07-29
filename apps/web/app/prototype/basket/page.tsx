import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { GNB } from "../_components/gnb";

// F07 장바구니 — GNB 탭 루트. 정책 미확정(제보 묶음 vs 품목 묶음+KAMIS 기준 등) — 준비중 상태만 노출.
export default function BasketPage() {
  return (
    <PhoneFrame>
      <AppBar title="장바구니" />
      <Scroll>
        <div className="flex flex-col items-center gap-2 px-4 pt-24 text-center">
          <p className="text-body-16-semibold text-fg-neutral">장바구니는 준비 중이에요</p>
          <p className="text-body-14-regular text-fg-neutral-subtle">
            여러 야채를 한 번에 담아 시세와 비교하는
            <br />
            기능을 정리하고 있어요
          </p>
        </div>
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
