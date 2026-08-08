import Link from "next/link";
import { ROUTES } from "../../_lib/routes";
import { AssetSlot } from "./_slots";

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
//   · 좌우 광학 여백이 비대칭이다(좌 16 / 우 20 — 검색 프레임 x=334, 390-334-48=8).
//     컨테이너 `px-2`(8) + 각 프레임 내부 패딩 8 = 광학 16으로 양쪽을 맞췄다.
//   · Status Bar(298:3478)는 iOS 목업이라 구현 대상이 아니다. 그래서 Figma의 top-64도 옮기지 않고
//     헤더를 스크롤 영역 맨 위에 둔다.
//
// 대비: 지역명 content/primary on 흰 배경 13.51:1 → 통과.

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
        <AssetSlot className="size-6" />
        <p className="whitespace-nowrap text-title-18-semibold text-content-primary">{region}</p>
      </div>

      {/*
        검색. Figma 개발 주석(298:3544): "검색 아이콘 클릭시 F02_야채시세 화면의
        검색 텍스트필드가 활성화된 상태(키보드) 화면으로 이동".
        ⚠️ "검색 활성 상태"를 F02에 어떻게 전달할지(쿼리 파라미터 등)는 Figma·스펙 모두 미정이라
           지금은 F02 진입까지만 연결한다. 규약이 정해지면 여기만 바꾸면 된다.
        터치 타겟 48×48로 44px 최소 기준을 넘는다(accessibility 스킬).
      */}
      <Link
        href={ROUTES.prices}
        aria-label="야채 검색"
        className="flex size-12 items-center justify-center py-2"
      >
        <AssetSlot className="size-6" />
      </Link>
    </header>
  );
}
