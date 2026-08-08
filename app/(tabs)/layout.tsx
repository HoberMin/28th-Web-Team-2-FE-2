import type { ReactNode } from "react";
import { TabNav } from "./_tab-nav";

// GNB가 유지되는 5개 탭의 공통 껍데기 (Figma `화면GUI` 298:3420 — 모든 탭 프레임 하단에
// nav/gnb가 고정으로 붙어 있다).
//
// 레이아웃 계약:
//   · 화면 전체 높이를 세로로 나눠 본문만 스크롤하고 GNB는 항상 바닥에 붙는다.
//   · Figma는 390×844 고정 프레임이지만 코드는 모바일 퍼스트 유동 폭이다(conventions #3).
//     390은 기준 뷰포트일 뿐 고정 폭이 아니다.
//   · 지도처럼 화면을 꽉 채우는 탭(F03)은 본문 안에서 h-full을 쓰면 된다.
//
// GNB를 화면마다 각자 렌더하지 않고 여기서 한 번만 렌더한다 — Figma에서 프레임마다 GNB
// 인스턴스가 제각각(detach 의심) 들어가 있는 문제를 코드에서는 구조적으로 막는다.
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col bg-surface-primary">
      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      {/*
        하단 safe area는 이 층이 소유한다. 루트 layout이 `viewportFit: "cover"`를 켜서
        뷰포트가 home indicator 영역까지 확장되므로, 화면 최하단 요소인 GNB가 그만큼을
        직접 흡수하지 않으면 라벨이 인디케이터 아래로 들어간다.
        `NavGnb`는 공용 컴포넌트(Figma 원본 pb 20)라 건드리지 않고 바깥에서 더한다.
        시트·화면 콘텐츠는 `<main>` 안이라 바닥에 닿지 않으므로 여기서 처리하면 안 된다.
      */}
      <div className="shrink-0 bg-surface-primary" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <TabNav />
      </div>
    </div>
  );
}
