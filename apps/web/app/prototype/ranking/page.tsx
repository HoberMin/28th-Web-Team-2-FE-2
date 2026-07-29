import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { GNB } from "../_components/gnb";
import { RankingContent } from "../_components/ranking-content";

// F06 랭킹 — GNB 탭 루트.
export default function RankingPage() {
  return (
    <PhoneFrame>
      <AppBar title="랭킹" />
      <Scroll>
        <RankingContent />
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
