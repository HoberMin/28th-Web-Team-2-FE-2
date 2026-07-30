import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { GNB } from "../_components/gnb";
import { MyPageContent } from "../_components/mypage-content";
import { getTodayIso } from "../_lib/home-data";

// F05 마이페이지 — GNB 탭 루트라 뒤로가기 없음. 찜/제보(시세 대비 소비) 모아보기. 데이터가 로컬이라 본문은 클라 leaf.
// 기준일은 서버에서 내려준다 — 주간 리포트가 기기 시계에 흔들리지 않게.
export default function MyPage() {
  return (
    <PhoneFrame>
      <AppBar title="마이페이지" />
      <Scroll>
        <MyPageContent todayIso={getTodayIso()} />
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
