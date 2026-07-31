import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { GNB } from "../_components/gnb";
import { RankingContent } from "../_components/ranking-content";

export const revalidate = 3600;

// F06 랭킹 — GNB 탭 루트. 제보왕 단독 화면(백로그 F06 재편) — 서버 fetch가 필요 없어져
// 정적 셸만 서버에서 그리고, 실제 순위는 클라 제보 스토어(reports-store)로 만든다.
export default function RankingPage() {
  return (
    <PhoneFrame>
      <AppBar title="제보왕" />
      <Scroll>
        <RankingContent />
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
