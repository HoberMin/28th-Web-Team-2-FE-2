import { AppBar, PhoneFrame, Scroll } from "../../_lib/shell";
import { FavoritesView } from "../../_components/favorites-view";
import { getPriceMap } from "../../_lib/home-data";

export const revalidate = 3600;

// F05-2 찜한 야채 — 마이페이지 허브에서 옮긴 목록. 오늘 시세는 서버(getPriceMap())에서 내려준다
// (홈·시세 화면과 같은 기준). 찜 자체는 localStorage라 본문은 클라 leaf.
export default async function MyPageFavoritesPage() {
  const priceMap = await getPriceMap();
  return (
    <PhoneFrame>
      <AppBar title="찜한 야채" backHref="/prototype/mypage" />
      <Scroll className="px-4 pb-10 pt-1">
        <FavoritesView priceMap={priceMap} />
      </Scroll>
    </PhoneFrame>
  );
}
