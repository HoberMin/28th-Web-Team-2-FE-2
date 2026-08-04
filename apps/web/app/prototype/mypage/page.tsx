import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { GNB } from "../_components/gnb";
import { MyPageContent } from "../_components/mypage-content";
import { getTodayIso } from "../_lib/home-data";

// F05 마이페이지 — GNB 탭 루트라 뒤로가기 없음. 프로필 + 주간 캘린더(제보 스탬프) + 리스트 메뉴.
// 기준일은 서버에서 내려준다 — 캘린더가 기기 시계로 흔들리지 않게(홈·시세 화면과 같은 기준).
//
// 금액 지표(누적·주간 절약, 총지출, 구매 건수)와 뱃지는 2026-08-04에 걷어냈다 →
// 이유는 `mypage-content.tsx` 주석. 설정(「내 정보」) 진입점은 상단 프로필 하나다.
//
// 시세(priceMap)는 더 이상 쓰지 않지만 revalidate는 남겨야 한다 — getTodayIso()가 렌더
// 시점의 날짜를 주간 캘린더로 넘기므로, 재검증이 없으면 **빌드된 날짜에 고정**되고 다음 주에도
// 지난주 캘린더가 보인다. 하루 1회 갱신이면 충분하지만 다른 화면과 같은 1시간으로 맞춘다.
export const revalidate = 3600;

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
