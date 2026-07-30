import { AppBar, PhoneFrame, Scroll } from "../../_lib/shell";
import { StoreAlertSettings } from "../../_components/store-alert-settings";

// F05-5 단골 가게 — 목록 + 매장 알림 토글 + 단골 해제. 데이터가 로컬(localStorage)이라 본문은 클라 leaf.
// 서버 fetch가 없어 정적 그대로(별도 revalidate 선언 불필요).
export default function MyPageStoresPage() {
  return (
    <PhoneFrame>
      <AppBar title="단골 가게" backHref="/prototype/mypage" />
      <Scroll className="px-4 pb-10 pt-1">
        <StoreAlertSettings />
      </Scroll>
    </PhoneFrame>
  );
}
