import { ShoppingMode } from "../_components/shopping-mode";
import { getPriceMap } from "../_lib/home-data";

export const revalidate = 3600;

// F11 장보는 중(매장 모드) — 장바구니를 들고 매장에 서 있는 사람을 위한 화면.
// 비교 기준(시세)은 서버에서 내려준다 — 담은 목록·제보는 클라(localStorage).
export default async function ShoppingPage() {
  const priceMap = await getPriceMap();
  return <ShoppingMode priceMap={priceMap} />;
}
