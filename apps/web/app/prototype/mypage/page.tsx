import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { GNB } from "../_components/gnb";
import { MyPageContent } from "../_components/mypage-content";
import { getPriceMap, getTodayIso } from "../_lib/home-data";

export const revalidate = 3600;

// F05 마이페이지 — GNB 탭 루트라 뒤로가기 없음. 허브형(프로필·절약·뱃지 + 리스트 메뉴).
// 기준일·시세는 서버에서 내려준다 — 절약 카드가 기기 시계·홈/시세 화면과 다른 기준으로
// 흔들리지 않게(예전엔 클라에서 더미 기준선을 직접 계산해 화면마다 "오늘 시세"가 갈렸다).
//
// 설정 진입점은 톱니(우측 상단)가 아니라 리스트 메뉴 맨 아래 「내 정보」로 옮겼다
// (`mypage-content.tsx`) — 마이페이지 허브에 진입점이 둘(톱니 + 메뉴)로 흩어져 있을 이유가 없다.
export default async function MyPage() {
  const priceMap = await getPriceMap();
  return (
    <PhoneFrame>
      <AppBar title="마이페이지" />
      <Scroll>
        <MyPageContent todayIso={getTodayIso()} priceMap={priceMap} />
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
