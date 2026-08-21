import Link from "next/link";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "../../_lib/routes";

// F01 홈 헤더 — 위치 칩 + 검색 버튼.
// Figma F01_홈 298:3480(위치 칩) · 298:3483(검색), F01_홈_더보기 298:3541 · 298:3544.
//
// ⚠️ 라이브러리 미승격 — Figma에 컴포넌트로 등록돼 있지 않다(둘 다 자동 이름 프레임
//    `Frame 2085667619` · `Frame 2085673384`). 그래서 `app/_components/`가 아니라 화면 로컬로 둔다.
//    다른 탭에도 같은 헤더가 나타나면 그때 공통화 대상이다.
//
// Figma 실측과 다르게 구현한 것:
//   · Figma는 두 프레임이 루트에 absolute로 놓여 있고 검색 버튼이 `left-[calc(75%+41.5px)]`라
//     390px에서만 우측에 맞는다. → `flex items-center justify-between`으로 바꿨다.
//   · ✅ **좌우 여백은 이제 대칭이다** — 화면GUI(원본) 364:6802·6805 재실측(2026-08-13):
//     위치 칩 x=8 w=88 / 검색 x=334 w=48 → 우측 여백도 390−334−48 = **8**. 좌 8 / 우 8.
//     (이전 회차의 "좌 16 / 우 20" 비대칭은 해소됐다 — GUI피드백 14번 종결)
//     컨테이너 `px-2`(8) + 각 프레임 내부 패딩 8 = 광학 16이 양쪽 그대로 유지된다.
//   · Status Bar(298:3478)는 iOS 목업이라 구현 대상이 아니다. 그래서 Figma의 top-64도 옮기지 않고
//     헤더를 스크롤 영역 맨 위에 둔다.
//
// 아이콘은 디자이너가 Figma Plugin API로 export해 준 원본 SVG를 사용한다
// (`public/figma/design-library/icons/`). 위치 핀은 최신 `F01_홈` 화면의 원본 주황색을 유지한다:
//   map-pin-fill  #ff850a
//   search        stroke #262f3c (= content/primary)
//
// 대비: 지역명 content/primary on 흰 배경 13.51:1 → 통과.
// ⚠️ 위치 핀 아이콘 #ff850a on 흰 배경 = 2.44:1 → UI 컴포넌트 기준 3:1 미달. 다만 바로 옆
//    지역명 텍스트가 같은 정보를 글자로 들고 있어 아이콘 단독으로 의미를 나르진 않는다.
//    Figma 원본 값을 유지하고 사실만 기록한다(figma-bridge §4).

export interface HomeHeaderProps {
  /** 현재 지역명. 예: "광진구" */
  region: string;
}

export function HomeHeader({ region }: HomeHeaderProps) {
  return (
    <header className="flex items-center justify-between px-2">
      {/*
        위치 칩. Figma에 클릭·이동 정의가 없어 **표시 전용**으로 뒀다.
        지역 변경 흐름이 생기면 button/Link로 감싸면 된다(내부 구조는 그대로).
      */}
      <div className="flex h-12 items-center gap-0.5 p-2">
        <FigmaIcon name="map-pin-fill" width={24} className="shrink-0" />
        <p className="whitespace-nowrap text-title-18-semibold text-content-primary">{region}</p>
      </div>

      {/*
        검색. Figma 개발 주석(298:3544): "검색 아이콘 클릭시 F02_야채시세 화면의
        검색 텍스트필드가 활성화된 상태(키보드) 화면으로 이동".
        `focus=search` 쿼리로 F02가 검색 필드에 자동 포커스를 주고 키보드 입력을 받는다.
        터치 타겟 48×48로 44px 최소 기준을 넘는다(accessibility 스킬).
      */}
      <Link
        href={`${ROUTES.prices}?focus=search`}
        aria-label="야채 검색"
        className="flex size-12 items-center justify-center py-2"
      >
        <FigmaIcon name="search" width={24} className="shrink-0" />
      </Link>
    </header>
  );
}
