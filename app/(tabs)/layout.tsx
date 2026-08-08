import type { ReactNode } from "react";
import { TabNav } from "./_tab-nav";

// GNB가 유지되는 5개 탭의 공통 껍데기 (Figma `화면GUI` 298:3420 — 모든 탭 프레임 하단에
// nav/gnb가 고정으로 붙어 있다).
//
// 레이아웃 계약:
//   · 화면 전체 높이를 세로로 나눠 본문만 스크롤하고 GNB는 항상 바닥에 붙는다.
//   · **폭은 iPhone 12 Pro 논리 해상도 390px에서 멈추고 가운데 정렬된다.** 이 서비스는
//     모바일 전용이고 Figma에도 데스크탑 시안이 없다 — 넓은 화면에서 콘텐츠를 늘리면
//     Figma에 없는 레이아웃을 코드가 지어내게 된다. 대신 폭을 묶어 시안 그대로 보여 준다.
//     `max-w-97.5` = 97.5 × 0.25rem = 390px (Tailwind 스페이싱 스케일. arbitrary value 아님)
//   · 390 **미만**에서는 여전히 유동이다(`w-full`) — 모바일 퍼스트를 깨지 않는다.
//     360px 기기에서 가로 스크롤이 생기지 않는다.
//   · 바깥 여백은 `surface/secondary`로 깔아 가운데 흰 기둥이 화면 경계와 구분되게 한다.
//     이게 없으면 데스크탑에서 흰 배경에 흰 콘텐츠라 레이아웃이 깨진 것처럼 보인다.
//   · 지도처럼 화면을 꽉 채우는 탭(F03)은 본문 안에서 h-full을 쓰면 된다 — 이 기둥 안에서
//     꽉 차는 것이지 뷰포트를 꽉 채우지 않는다.
//
// ⚠️ 높이는 844로 고정하지 않는다. Figma 프레임이 390×844이긴 하지만, 세로를 묶으면 긴
//    화면(F01 홈 1263px · F04 찜 1209px)이 이미 프레임을 넘기 때문에 어차피 내부 스크롤이고,
//    데스크탑에서 아래쪽에 빈 띠만 남는다. 세로는 뷰포트를 그대로 쓴다.
//
// GNB를 화면마다 각자 렌더하지 않고 여기서 한 번만 렌더한다 — Figma에서 프레임마다 GNB
// 인스턴스가 제각각(detach 의심) 들어가 있는 문제를 코드에서는 구조적으로 막는다.
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh justify-center bg-surface-secondary">
      <div className="flex h-full w-full max-w-97.5 flex-col bg-surface-primary">
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        {/*
          하단 safe area는 이 층이 소유한다. 루트 layout이 `viewportFit: "cover"`를 켜서
          뷰포트가 home indicator 영역까지 확장되므로, 화면 최하단 요소인 GNB가 그만큼을
          직접 흡수하지 않으면 라벨이 인디케이터 아래로 들어간다.
          `NavGnb`는 공용 컴포넌트(Figma 원본 pb 20)라 건드리지 않고 바깥에서 더한다.
          시트·화면 콘텐츠는 `<main>` 안이라 바닥에 닿지 않으므로 여기서 처리하면 안 된다.
        */}
        <div
          className="shrink-0 bg-surface-primary"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <TabNav />
        </div>
      </div>
    </div>
  );
}
