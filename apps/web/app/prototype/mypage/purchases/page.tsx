import { AppBar, PhoneFrame, Scroll } from "../../_lib/shell";
import { PurchasesView } from "../../_components/purchases-view";
import { getPriceMap, getTodayIso } from "../../_lib/home-data";

export const revalidate = 3600;

// F05-4 구매 — 「살 때 된 야채」(홈에서 옮김) + 구매 내역. 라벨을 「구매 내역」이 아니라 「구매」로
// 둔 이유는 과거 기록뿐 아니라 다음 구매 안내(RepurchaseCard)를 같이 담기 때문.
// 오늘 시세는 서버(getPriceMap())에서 내려준다(홈·시세 화면과 같은 기준).
export default async function MyPagePurchasesPage() {
  const priceMap = await getPriceMap();
  return (
    <PhoneFrame>
      <AppBar title="구매" backHref="/prototype/mypage" />
      <Scroll className="px-4 pb-10 pt-1">
        <PurchasesView todayIso={getTodayIso()} priceMap={priceMap} />
      </Scroll>
    </PhoneFrame>
  );
}
