import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { MyPageContent } from "../_components/mypage-content";

// 마이페이지 — 찜/제보(시세 대비 소비) 모아보기. 데이터가 로컬이라 본문은 클라 leaf.
export default function MyPage() {
  return (
    <PhoneFrame>
      <AppBar title="마이페이지" backHref="/prototype" />
      <Scroll>
        <MyPageContent />
      </Scroll>
    </PhoneFrame>
  );
}
