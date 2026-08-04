import { PhoneFrame } from "../_lib/shell";
import { GNB } from "../_components/gnb";
import { StoresMapView } from "../_components/stores-map-view";
import { getPriceMap, getTodayIso } from "../_lib/home-data";

export const revalidate = 3600;

// 동네 가게 탭 — GNB 탭 루트. 화면 전체가 지도다(2026-08-04 개편, 이전엔 가게 목록 두 층).
// AppBar·Scroll을 쓰지 않는다 — 지도가 프레임을 꽉 채우고, 스크롤은 지도 자체의 팬으로 대체된다.
//
// 가게 집계는 실제 제보(클라 localStorage)로 만들고, 비교 기준이 되는 시세는 서버에서 내려준다
// (클라에서 기준까지 만들면 화면마다 숫자가 갈린다).
export default async function StoresPage() {
  const priceMap = await getPriceMap();
  return (
    <PhoneFrame>
      <StoresMapView priceMap={priceMap} todayIso={getTodayIso()} />
      <GNB />
    </PhoneFrame>
  );
}
