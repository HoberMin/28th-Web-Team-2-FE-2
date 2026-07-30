import Link from "next/link";
import IconGearLine from "@karrotmarket/react-monochrome-icon/IconGearLine";
import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { GNB } from "../_components/gnb";
import { MyPageContent } from "../_components/mypage-content";
import { getPriceMap, getTodayIso } from "../_lib/home-data";

export const revalidate = 3600;

// F05 마이페이지 — GNB 탭 루트라 뒤로가기 없음. 허브형(프로필·절약·뱃지 + 리스트 메뉴).
// 기준일·시세는 서버에서 내려준다 — 절약 카드가 기기 시계·홈/시세 화면과 다른 기준으로
// 흔들리지 않게(예전엔 클라에서 더미 기준선을 직접 계산해 화면마다 "오늘 시세"가 갈렸다).
export default async function MyPage() {
  const priceMap = await getPriceMap();
  return (
    <PhoneFrame>
      <AppBar
        title="마이페이지"
        right={
          <Link
            href="/prototype/mypage/settings"
            aria-label="설정"
            className="flex size-12 items-center justify-center rounded-full text-fg-neutral hover:bg-bg-neutral-weak [&_svg]:size-6"
          >
            <IconGearLine />
          </Link>
        }
      />
      <Scroll>
        <MyPageContent todayIso={getTodayIso()} priceMap={priceMap} />
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
