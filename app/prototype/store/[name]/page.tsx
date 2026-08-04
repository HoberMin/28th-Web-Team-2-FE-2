import { StoreDetail } from "../../_components/store-detail";
import { getPriceMap, getTodayIso } from "../../_lib/home-data";

export const revalidate = 3600;

// F09 가게 상세 — 한 가게의 전 품목 제보가를 한 화면에 모은다.
// 제보는 localStorage(클라)에 있어 목록은 클라에서 만들고, **비교 기준(시세)은 서버에서** 내려준다.
export default async function StorePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const [priceMap, todayIso] = [await getPriceMap(), getTodayIso()];
  return <StoreDetail storeName={decodeURIComponent(name)} priceMap={priceMap} todayIso={todayIso} />;
}
