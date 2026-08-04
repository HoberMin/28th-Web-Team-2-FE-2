import { AppBar, PhoneFrame, Scroll } from "../../_lib/shell";
import { SettingsView } from "../../_components/settings-view";
import { getPriceSnapshotMap, getTodayIso } from "../../_lib/home-data";

export const revalidate = 3600;

// F05-1 「내 정보」 — 계정(닉네임·동네·프로필 이미지) / 알림(전역 토글 + 오늘의 미리보기) /
// 약관·버전·문의(더미) / 로그아웃·탈퇴. 진입점은 마이페이지 톱니가 아니라 리스트 메뉴 맨 아래
// 「내 정보」 줄(`mypage-content.tsx`)이다.
// 시세 스냅샷(오늘가·최근 평균)은 알림 다이제스트 미리보기가 홈·시세 화면과 같은 기준을 쓰게
// 서버에서 내려준다(제보·찜·단골은 로컬이라 본문은 여전히 클라 leaf).
export default async function MyPageSettingsPage() {
  const priceMap = await getPriceSnapshotMap();
  return (
    <PhoneFrame>
      <AppBar title="내 정보" backHref="/prototype/mypage" />
      <Scroll className="px-4 pb-10 pt-1">
        <SettingsView priceMap={priceMap} todayIso={getTodayIso()} />
      </Scroll>
    </PhoneFrame>
  );
}
