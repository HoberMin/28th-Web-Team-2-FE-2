import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { GNB } from "../_components/gnb";
import { RankingContent } from "../_components/ranking-content";
import { getPriceMap, getTodayIso } from "../_lib/home-data";

export const revalidate = 3600;

// F06 랭킹 — GNB 탭 루트. 가게 순위는 실제 제보(클라)로 만들고 비교 기준(시세)은 서버에서 내려준다.
export default async function RankingPage() {
  const priceMap = await getPriceMap();
  return (
    <PhoneFrame>
      <AppBar title="랭킹" />
      <Scroll>
        <RankingContent priceMap={priceMap} todayIso={getTodayIso()} />
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
