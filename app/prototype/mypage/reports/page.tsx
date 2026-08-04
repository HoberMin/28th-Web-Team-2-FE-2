import { AppBar, PhoneFrame, Scroll } from "../../_lib/shell";
import { ReportsView } from "../../_components/reports-view";
import { getPriceMap } from "../../_lib/home-data";

export const revalidate = 3600;

// F05-3 내 제보 — 마이페이지 허브에서 옮긴 목록 + 수정·삭제(⋯ 메뉴). 오늘 시세는 서버
// (getPriceMap())에서 내려준다(홈·시세 화면과 같은 기준). 제보 자체는 로컬이라 본문은 클라 leaf.
export default async function MyPageReportsPage() {
  const priceMap = await getPriceMap();
  return (
    <PhoneFrame>
      <AppBar title="내 제보" backHref="/prototype/mypage" />
      <Scroll className="px-4 pb-10 pt-1">
        <ReportsView priceMap={priceMap} />
      </Scroll>
    </PhoneFrame>
  );
}
