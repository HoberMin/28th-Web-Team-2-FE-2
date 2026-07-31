import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { GNB } from "../_components/gnb";
import { StoresContent } from "../_components/stores-content";
import { getPriceMap, getTodayIso } from "../_lib/home-data";

export const revalidate = 3600;

// 가게 탭 — GNB 탭 루트. 가게 순위는 실제 제보(클라 localStorage)로 만들고,
// 비교 기준이 되는 시세는 서버에서 내려준다(클라에서 기준까지 만들면 화면마다 숫자가 갈린다).
export default async function StoresPage() {
  const priceMap = await getPriceMap();
  return (
    <PhoneFrame>
      <AppBar title="가게" />
      <Scroll>
        <StoresContent priceMap={priceMap} todayIso={getTodayIso()} />
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
