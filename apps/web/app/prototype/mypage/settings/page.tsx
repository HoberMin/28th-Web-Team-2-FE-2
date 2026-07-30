import { AppBar, PhoneFrame, Scroll } from "../../_lib/shell";
import { SettingsView } from "../../_components/settings-view";

// F05-1 설정 — 계정(닉네임·동네·프로필 이미지) / 알림 / 약관·버전·문의(더미) / 로그아웃·탈퇴.
// 데이터가 로컬(localStorage)이라 본문은 클라 leaf. 서버 fetch가 없어 정적 그대로.
export default function MyPageSettingsPage() {
  return (
    <PhoneFrame>
      <AppBar title="설정" backHref="/prototype/mypage" />
      <Scroll className="px-4 pb-10 pt-1">
        <SettingsView />
      </Scroll>
    </PhoneFrame>
  );
}
