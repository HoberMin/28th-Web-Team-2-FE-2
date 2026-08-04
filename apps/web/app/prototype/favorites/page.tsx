import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { GNB } from "../_components/gnb";
import { FavoritesTabs } from "../_components/favorites-tabs";
import { getPriceMap } from "../_lib/home-data";

// 시세는 하루 1회 갱신 → 1시간 단위 재검증(홈·야채시세 탭과 같은 기준선).
export const revalidate = 3600;

// 찜 — GNB 탭 루트. 「야채」/「가게」 2탭(2026-08-04 신설, 랭킹 탭 자리를 대체).
// 이전엔 마이페이지 하위 화면 둘(찜한 야채·단골 가게)로 흩어져 있었다.
// RSC 기본: 오늘 시세만 서버에서 조립하고, 찜 목록(localStorage)·탭 전환은 클라 leaf.
export default async function FavoritesPage() {
  const priceMap = await getPriceMap();

  return (
    <PhoneFrame>
      <AppBar title="찜" />
      <Scroll className="px-4 pb-10 pt-1">
        <FavoritesTabs priceMap={priceMap} />
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
