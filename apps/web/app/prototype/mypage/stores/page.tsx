import { AppBar, PhoneFrame, Scroll } from "../../_lib/shell";
import { FavoriteStoresView } from "../../_components/favorite-stores-view";

// F05-5 찜한 가게 — 목록 + 찜 해제. 알림은 전역 토글(「내 정보」)로 옮겨가 이 화면엔 없다.
// 데이터가 로컬(localStorage)이라 본문은 클라 leaf. 서버 fetch가 없어 정적 그대로(별도 revalidate 선언 불필요).
export default function MyPageStoresPage() {
  return (
    <PhoneFrame>
      <AppBar title="찜한 가게" backHref="/prototype/mypage" />
      <Scroll className="px-4 pb-10 pt-1">
        <FavoriteStoresView />
      </Scroll>
    </PhoneFrame>
  );
}
